module.exports = {
  presets: [
    // Not really sure if this is needed. Didn't add it to fix any error but it's likely the
    // primary way of defining browser support.
    ["@babel/preset-env",
      {
        targets: {
          browsers: ["> 0.25%", "not dead"],
          node: 'current'
        },
      },
    ],
    ["@babel/preset-react", {
      // Disables React v17 new JSX transform until theme-ui beta release supporting the
      // change is made stable. https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html
      // When supported it appears that the pragma currently used in all componets will have to change.
      // See https://dev.theme-ui.com/api.
      "runtime": "classic"
    }],
    ["@babel/preset-typescript"]
  ],
  plugins: [
    // Needed to allow using async/await javascript functions and avoid the 'regeneratorRuntime is not 
    // defined' error for some reason. :S https://github.com/parcel-bundler/parcel/issues/1762
    "@babel/plugin-transform-runtime"
  ]
}