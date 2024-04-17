### Internal libraries
If you want to create a library, there are some steps you need to consider:

1. Libraries can be found in `src/core/libs`
2. Files sould be in folders that (by convention) are named after the namespace they export to
3. Files in subfolders of these will not be built unless they are named `index.js`
4. Files control their own namespaces, no exports are used (see below)
5. The resulting filename will have the structure `folder_subfolder.min/max.js`.
6. If a file is in the `cables/` namespace, the resulting filename will be `filename.js`
7. Every library in a subfolder (see 3.) needs an `index.js` as the main entry point.
8. Webpack builds minified and non-minified versions to `build/libs/`
9. use `npm run build` to build the libraries
10. libraries are coped to `../cables_api/public/libs_core/`

#### Example:

Input structure:
```bash
libs
├── cgl
│   ├── cubemap
│   │   └── index.js
│   ├── light
│   │   ├── createShaders.js
│   │   └── index.js
│   └── functions.js
|── cables
    └── vargetset.js
```

Output structure:
```bash
libs
├── cgl_cubemap.js
├── cgl_light.js
├── cgl_functions.js
├── vargetset.js
```
#### Working with internal libraries

#### Root level libraries
1. All libraries have to "provide" and own or use an existing namespace, i.e.:

    `libs/cables/math.js`:
    ```javascript
    const add = (num1, num2) => num1 + num2;
    const sub = (num1, num2) => num1 - num2;

    CABLES.Math = { add: add, sub: sub };

    // results in CABLES.Math.add(1, 2);
2. For the above example the exported file would be called `math.max/min.js`.
3. This also means that these libraries may be dependent on other libraries being loaded alongside or before them (as above with `CABLES`).
4. Handle with care!
5. You can use shared imports in subfolders like this:

    `libs/cables/math/index.js`:
    ```javascript
    import linearAlgebra from "./linearAlgebra" // make sure libs/cables/math/linearAlgebra.js exists!
    const add = (num1, num2) => num1 + num2;
    const sub = (num1, num2) => num1 - num2;

    CABLES.Math = CABLES.MATH || {};
    CABLES.Math.linearAlgebra = linearAlgebra;

    // results in
    //   - file:
    //   - CABLES.Math.linearAlgebra;

#### Adding libraries to ops

1. Click the op in the UI
2. Go to the `Core Libs` tab
3. Get your library file from the dropdown, click `Add`
4. Reload patch
5. profit


