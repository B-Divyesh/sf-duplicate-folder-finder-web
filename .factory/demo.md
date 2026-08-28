# Demo sandbox

- Direct URL: `https://duplicate-folder-finder-web.sociobot.in/demo`
- One-click URL: `https://duplicate-folder-finder-web.sociobot.in/?demo=1`
- Sample: `Photo archive` has three files. `Backup drive` has four files. Their `albums` folders match exactly, the receipt changed, and the backup has one extra note.
- Entry: either URL loads and completes the sample comparison without another click.
- Reset: **Reset demo** clears the demo report and rebuilds the original sample.
- Exit: **Compare my folders** clears demo storage and returns to the empty or previously saved real workspace.
- Isolation: real reports use IndexedDB database `mirrorbyte-local`; demo reports use `mirrorbyte-demo`. Demo mode never reads or writes `mirrorbyte-local`.
- Offline: the sample and scanner ship in the precached app shell, so the demo can reload and reset offline after the first visit.
