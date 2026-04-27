# Tyson Shields - Personal Website

### Root Directory

- **index.html**: This is my landing page and the main entry point for the site.
- **.gitignore**: Tells Git which files to ignore so I don't track unnecessary junk.
- **README.md**: That's this file. It helps me (and anyone else) understand how everything is organized.
- **package.json**: Where I'll keep track of my project info and any tools I decide to use.

### src/ (The Source)

This is where all my actual code lives.

#### src/pages/

These are the main sections of my site.

- **about.html**: My bio, education, and professional background.
- **portfolio.html**: Where I show off my best, most polished projects.
- **lab.html**: The hub for all my experiments and the apps I've built.
- **contact.html**: How people can get in touch with me.
- **blog.html**: A place for my thoughts on tech and development.

#### src/apps/

I use this folder for standalone functional projects. Each one gets its own folder so the code stays isolated.

- **calculator/**: A simple app I built with its own HTML, CSS, and JS.
- **data-visualization/**: My dedicated space for math and data-heavy interactive projects.
- **weather-app/**: A real-time weather dashboard using an external API.

#### src/components/

Modular pieces I reuse across the site so I don't have to rewrite code.

- **navbar.html**: My top navigation bar.
- **footer.html**: My standard footer for every page.

#### src/assets/

All my global static files.

- **css/variables.css**: I keep my colors and fonts here so I can change my theme in one place.
- **css/main.css**: The core layout and styling for the site.
- **js/main.js**: Site-wide interactivity.
- **js/utils.js**: A place for helper functions I use in multiple scripts.
- **images/**: My profile photo and an **icons/** folder for things like my `favicon.ico`.
- **downloads/resume.pdf**: My current resume for anyone who needs a copy.
