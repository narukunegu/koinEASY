#[cfg(desktop)]
use plugins::logging;

use std::{
    fs,
    io::{Read, Write},
    path::PathBuf,
};
use tauri::{AppHandle, Manager, Runtime};
use tauri_plugin_decorum::WebviewWindowExt;
use tauri_plugin_fs::{FsExt, OpenOptions};
use tauri_plugin_sql::{Builder, Migration, MigrationKind};

#[cfg(desktop)]
pub mod plugins;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        // Define your migrations here
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: "CREATE TABLE chats (id INTEGER PRIMARY KEY, title TEXT, messages TEXT);",
            kind: MigrationKind::Up,
        },
    ];

    let mut builder = tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:chats.db", migrations)
                .build(),
        )
        .plugin(tauri_plugin_fs::init());

    // CrabNebula DevTools prevents other logging plugins from working
    // https://docs.crabnebula.dev/devtools/troubleshoot/log-plugins/

    #[cfg(desktop)]
    {
        #[cfg(debug_assertions)]
        {
            let devtools = tauri_plugin_devtools::init();
            builder = builder.plugin(devtools);
        }

        #[cfg(not(debug_assertions))]
        {
            builder = builder.plugin(logging::tauri_plugin_logging());
        }
        builder = builder
            .plugin(tauri_plugin_window_state::Builder::default().build())
            .plugin(tauri_plugin_single_instance::init(|_, _, _| {}));
    }

    builder
        .plugin(tauri_plugin_decorum::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![])
        .setup(|app| {
            // Create a custom titlebar for main window
            // On Windows this hides decoration and creates custom window controls
            // On macOS it needs hiddenTitle: true and titleBarStyle: overlay
            #[cfg(desktop)]
            {
                let main_window = app.get_webview_window("main").unwrap();
                main_window.create_overlay_titlebar().unwrap();
            }

            // Some macOS-specific helpers
            #[cfg(target_os = "macos")]
            {
                // Set a custom inset to the traffic lights
                main_window.set_traffic_lights_inset(12.0, 16.0).unwrap();

                // Make window transparent without privateApi
                main_window.make_transparent().unwrap();
            }

            let dst_path = "com.github.koineasy/greek-mor.db";
            #[cfg(mobile)]
            let dst_path = "greek-mor.db";

            let app_handle = app.app_handle();
            let _ = setup_data_file("greek-mor.db", dst_path, &app_handle)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn setup_data_file<R>(s: &str, d: &str, app: &AppHandle<R>) -> std::io::Result<PathBuf>
where
    R: tauri::Runtime,
{
    let dst_path = app.app_handle().path().data_dir().unwrap().join(d);
    if fs::exists(&dst_path).is_ok_and(|e| e) {
        // destination file with this name already exists
        return Ok(dst_path);
    }

    let src_path = app
        .app_handle()
        .path()
        .resource_dir()
        .unwrap()
        .join(format!("resources/{s}"));
    let src_opts = OpenOptions::new().read(true).to_owned();
    let mut s_f = app.fs().open(src_path, src_opts)?;

    let mut d_f = std::fs::OpenOptions::new()
        .read(true)
        .write(true)
        .create(true)
        .truncate(true)
        .open(dst_path.clone())?;
    let mut buf = vec![0u8; 8192];
    //let mut sent = 0usize;
    loop {
        let l = s_f.read(&mut buf)?;
        if l == 0 {
            break;
        }
        //sent += l;
        d_f.write_all(&buf[..l])?;
    }
    Ok(dst_path)
}
