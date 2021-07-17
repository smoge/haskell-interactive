# HASKELL INTERACTIVE

This extension allows you to execute snippets of Haskell code from within your editor window.

## Requirements
This extension uses the interactive GHC interpreter GHCI to execute Haskell code. If you use Stack for managing your projects, you can change the command to start the GHCI interpreter in the extensions settings (`haskell-interactive.ghciLaunchCommand`)

## Usage

### Running snippets
Use the `haskel-interactive.run_haskell_terminal` keybind to send selected snippets to the terminal window (default is `Shift`+`Enter`)

If you have text selected when sending the snippet, only that part will be sent to the GHCI terminal. In the example below, only the `[]` part of the function will be sent to the terminal:
![alt text](images/selected-text.gif)

When nothing is selected, the extension will try to capture the entire function that the cursor is in. In the example below, the whole function will be sent to the terminal when pressing the keybind:
![alt text](images/no-selection.gif)

