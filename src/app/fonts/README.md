# Fonts

Latin subsets from Google Fonts, kept in the repo so builds don't download anything.
All four are under the SIL Open Font License 1.1, see `OFL.txt`.

| File | Family | Used for |
| --- | --- | --- |
| `playfair-display.woff2`, `playfair-display-italic.woff2` | Playfair Display (variable weight) | headings |
| `karla.woff2` | Karla (variable weight) | body and UI text |
| `courier-prime-400.woff2`, `courier-prime-700.woff2` | Courier Prime | main buttons, terminal |
| `patrick-hand.woff2` | Patrick Hand | the theme tip |

To update one, fetch `https://fonts.googleapis.com/css2?family=<Family>` with a current
browser user agent and take the file under the `/* latin */` block.
