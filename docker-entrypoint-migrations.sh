#!/bin/bash
set -e

# Get connection string from environment variable
CONN_STRING="${ConnectionStrings__DefaultConnection:-Host=postgres;Port=5432;Database=whattoeat;Username=postgres;Password=postgres}"

# If the first argument is a dotnet ef subcommand, add --connection parameter
if [ "$#" -gt 0 ]; then
    case "$1" in
        database|migrations|dbcontext)
            # Execute dotnet ef with the connection string
            exec dotnet ef "$@" --connection "$CONN_STRING"
            ;;
        --help|-h|--version)
            # Pass through help and version commands
            exec dotnet ef "$@"
            ;;
        *)
            # For any other command, try to add connection string if it's an EF command
            exec dotnet ef "$@" --connection "$CONN_STRING"
            ;;
    esac
else
    # No arguments, show help
    exec dotnet ef --help
fi
