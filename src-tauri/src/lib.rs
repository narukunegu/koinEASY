#[cfg(desktop)]
use plugins::logging;

use tauri::{AppHandle, Manager, Runtime};
use tauri_plugin_decorum::WebviewWindowExt;
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
            sql: "CREATE TABLE chats (id INTEGER PRIMARY KEY, title TEXT, messages TEXT, words TEXT);",
            kind: MigrationKind::Up,
        },
    ];

    let mut builder = tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:user.db", migrations)
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

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
