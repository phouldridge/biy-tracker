# Bible in a Year Tracker

This is a small, mobile-friendly tracker that lists every day of the year as a checkbox. Tap a day to play the corresponding audio (streamed from listenersbible.com) and mark it checked. Checked days are saved in your browser's local storage so your progress persists on the same device/browser.

## Usage

- Open `index.html` in a mobile browser or desktop browser.
- The list of days is scrollable while the header and controls remain fixed.
- Tap the hamburger menu (top-right) to access actions:
  - `Clear` — clears all checked days (you will be asked to confirm).
  - `Check All` — marks every day as checked and saves to local storage.
  - `About` — opens a short informational dialog about the site.
- Tap any unchecked day's checkbox to play its audio and mark it checked. Tapping a checked box will uncheck it (no audio plays when unchecking).

## Credits

This site streams audio files hosted on listenersbible.com. The audio URLs are not hosted here; they are fetched directly from `https://listenersbible.com/...` when you tap a day.

## License & Disclaimer

- This project is provided for personal use only. It is intended as a lightweight personal tracker and convenience UI for streaming publicly available audio files. Do not use this project for redistribution of the audio files or for commercial purposes.
- The author of this tracker is not affiliated with listenersbible.com. All rights to the audio content belong to the original host/owner.
- Use at your own risk. The project makes network requests to external servers; ensure you understand privacy/security implications of streaming remote media.
