# Gerard Bobby — Portfolio

A responsive, reference-inspired portfolio built with one HTML file, one stylesheet, and one JavaScript file. No build step is required.

## Preview

Open `index.html` in a browser, or serve this directory with `python -m http.server 8000` and visit `http://localhost:8000`.

## Updating content

- Project descriptions and links live in `index.html`. The selected-work carousel reads its titles and descriptions from the project archive; its categories and artwork are configured in `projectVisuals` in `script.js`.
- Project videos live in `videos/`. Gallery thumbnails captured from those videos live in `others/project-previews/`. Include the thumbnails when committing and deploying.
- Certificate gallery paths are in the certificate arrays in `script.js`; previews remain in `certificates/<category>/previews/`.
- Add the three IT-support recordings as `videos/Project 8 - Video 1.mp4` through `Project 8 - Video 3.mp4`. Until those files are present, their slots show “Recording coming soon”.
- Coursework descriptions and ZIP destinations are in `index.html`. Put the corresponding archives in `coursework-files/` before enabling public downloads.

Light mode is the initial theme. The theme and coursework visibility controls remember the visitor's choices. Navigation opens focused section views with type-on headings. Project pages support URL fragments such as `#project7`, and the carousel supports arrow keys and touch swipes. Dialogs support Escape, focus trapping, and focus restoration. Motion is reduced when requested in system preferences.

The contact composer opens a prefilled Gmail draft for the visitor to review and send; it does not send messages itself. A mail-app alternative is also available. Until a resume file is supplied, the resume button opens a request form instead of a download.
