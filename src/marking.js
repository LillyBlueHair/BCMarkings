(function () {
    "use strict";
    var bcModSdk = (function () {
        "use strict";
        const o = "1.2.0";
        function e(o) {
            alert("Mod ERROR:\n" + o);
            const e = new Error(o);
            throw (console.error(e), e);
        }
        const t = new TextEncoder();
        function n(o) {
            return !!o && "object" == typeof o && !Array.isArray(o);
        }
        function r(o) {
            const e = new Set();
            return o.filter((o) => !e.has(o) && e.add(o));
        }
        const i = new Map(),
            a = new Set();
        function c(o) {
            a.has(o) || (a.add(o), console.warn(o));
        }
        function s(o) {
            const e = [],
                t = new Map(),
                n = new Set();
            for (const r of f.values()) {
                const i = r.patching.get(o.name);
                if (i) {
                    e.push(...i.hooks);
                    for (const [e, a] of i.patches.entries())
                        t.has(e) &&
                            t.get(e) !== a &&
                            c(
                                `ModSDK: Mod '${r.name}' is patching function ${
                                    o.name
                                } with same pattern that is already applied by different mod, but with different pattern:\nPattern:\n${e}\nPatch1:\n${
                                    t.get(e) || ""
                                }\nPatch2:\n${a}`
                            ),
                            t.set(e, a),
                            n.add(r.name);
                }
            }
            e.sort((o, e) => e.priority - o.priority);
            const r = (function (o, e) {
                if (0 === e.size) return o;
                let t = o.toString().replaceAll("\r\n", "\n");
                for (const [n, r] of e.entries()) t.includes(n) || c(`ModSDK: Patching ${o.name}: Patch ${n} not applied`), (t = t.replaceAll(n, r));
                return (0, eval)(`(${t})`);
            })(o.original, t);
            let i = function (e) {
                var t, i;
                const a = null === (i = (t = m.errorReporterHooks).hookChainExit) || void 0 === i ? void 0 : i.call(t, o.name, n),
                    c = r.apply(this, e);
                return null == a || a(), c;
            };
            for (let t = e.length - 1; t >= 0; t--) {
                const n = e[t],
                    r = i;
                i = function (e) {
                    var t, i;
                    const a = null === (i = (t = m.errorReporterHooks).hookEnter) || void 0 === i ? void 0 : i.call(t, o.name, n.mod),
                        c = n.hook.apply(this, [
                            e,
                            (o) => {
                                if (1 !== arguments.length || !Array.isArray(e))
                                    throw new Error(`Mod ${n.mod} failed to call next hook: Expected args to be array, got ${typeof o}`);
                                return r.call(this, o);
                            },
                        ]);
                    return null == a || a(), c;
                };
            }
            return { hooks: e, patches: t, patchesSources: n, enter: i, final: r };
        }
        function l(o, e = !1) {
            let r = i.get(o);
            if (r) e && (r.precomputed = s(r));
            else {
                let e = window;
                const a = o.split(".");
                for (let t = 0; t < a.length - 1; t++)
                    if (((e = e[a[t]]), !n(e))) throw new Error(`ModSDK: Function ${o} to be patched not found; ${a.slice(0, t + 1).join(".")} is not object`);
                const c = e[a[a.length - 1]];
                if ("function" != typeof c) throw new Error(`ModSDK: Function ${o} to be patched not found`);
                const l = (function (o) {
                        let e = -1;
                        for (const n of t.encode(o)) {
                            let o = 255 & (e ^ n);
                            for (let e = 0; e < 8; e++) o = 1 & o ? -306674912 ^ (o >>> 1) : o >>> 1;
                            e = (e >>> 8) ^ o;
                        }
                        return ((-1 ^ e) >>> 0).toString(16).padStart(8, "0").toUpperCase();
                    })(c.toString().replaceAll("\r\n", "\n")),
                    d = { name: o, original: c, originalHash: l };
                (r = Object.assign(Object.assign({}, d), {
                    precomputed: s(d),
                    router: () => {},
                    context: e,
                    contextProperty: a[a.length - 1],
                })),
                    (r.router = (function (o) {
                        return function (...e) {
                            return o.precomputed.enter.apply(this, [e]);
                        };
                    })(r)),
                    i.set(o, r),
                    (e[r.contextProperty] = r.router);
            }
            return r;
        }
        function d() {
            for (const o of i.values()) o.precomputed = s(o);
        }
        function p() {
            const o = new Map();
            for (const [e, t] of i)
                o.set(e, {
                    name: e,
                    original: t.original,
                    originalHash: t.originalHash,
                    sdkEntrypoint: t.router,
                    currentEntrypoint: t.context[t.contextProperty],
                    hookedByMods: r(t.precomputed.hooks.map((o) => o.mod)),
                    patchedByMods: Array.from(t.precomputed.patchesSources),
                });
            return o;
        }
        const f = new Map();
        function u(o) {
            f.get(o.name) !== o && e(`Failed to unload mod '${o.name}': Not registered`), f.delete(o.name), (o.loaded = !1), d();
        }
        function g(o, t) {
            (o && "object" == typeof o) || e("Failed to register mod: Expected info object, got " + typeof o),
                ("string" == typeof o.name && o.name) || e("Failed to register mod: Expected name to be non-empty string, got " + typeof o.name);
            let r = `'${o.name}'`;
            ("string" == typeof o.fullName && o.fullName) ||
                e(`Failed to register mod ${r}: Expected fullName to be non-empty string, got ${typeof o.fullName}`),
                (r = `'${o.fullName} (${o.name})'`),
                "string" != typeof o.version && e(`Failed to register mod ${r}: Expected version to be string, got ${typeof o.version}`),
                o.repository || (o.repository = void 0),
                void 0 !== o.repository &&
                    "string" != typeof o.repository &&
                    e(`Failed to register mod ${r}: Expected repository to be undefined or string, got ${typeof o.version}`),
                null == t && (t = {}),
                (t && "object" == typeof t) || e(`Failed to register mod ${r}: Expected options to be undefined or object, got ${typeof t}`);
            const i = !0 === t.allowReplace,
                a = f.get(o.name);
            a &&
                ((a.allowReplace && i) ||
                    e(`Refusing to load mod ${r}: it is already loaded and doesn't allow being replaced.\nWas the mod loaded multiple times?`),
                u(a));
            const c = (o) => {
                    let e = g.patching.get(o.name);
                    return e || ((e = { hooks: [], patches: new Map() }), g.patching.set(o.name, e)), e;
                },
                s =
                    (o, t) =>
                    (...n) => {
                        var i, a;
                        const c = null === (a = (i = m.errorReporterHooks).apiEndpointEnter) || void 0 === a ? void 0 : a.call(i, o, g.name);
                        g.loaded || e(`Mod ${r} attempted to call SDK function after being unloaded`);
                        const s = t(...n);
                        return null == c || c(), s;
                    },
                p = {
                    unload: s("unload", () => u(g)),
                    hookFunction: s("hookFunction", (o, t, n) => {
                        ("string" == typeof o && o) || e(`Mod ${r} failed to patch a function: Expected function name string, got ${typeof o}`);
                        const i = l(o),
                            a = c(i);
                        "number" != typeof t && e(`Mod ${r} failed to hook function '${o}': Expected priority number, got ${typeof t}`),
                            "function" != typeof n && e(`Mod ${r} failed to hook function '${o}': Expected hook function, got ${typeof n}`);
                        const s = { mod: g.name, priority: t, hook: n };
                        return (
                            a.hooks.push(s),
                            d(),
                            () => {
                                const o = a.hooks.indexOf(s);
                                o >= 0 && (a.hooks.splice(o, 1), d());
                            }
                        );
                    }),
                    patchFunction: s("patchFunction", (o, t) => {
                        ("string" == typeof o && o) || e(`Mod ${r} failed to patch a function: Expected function name string, got ${typeof o}`);
                        const i = l(o),
                            a = c(i);
                        n(t) || e(`Mod ${r} failed to patch function '${o}': Expected patches object, got ${typeof t}`);
                        for (const [n, i] of Object.entries(t))
                            "string" == typeof i
                                ? a.patches.set(n, i)
                                : null === i
                                ? a.patches.delete(n)
                                : e(`Mod ${r} failed to patch function '${o}': Invalid format of patch '${n}'`);
                        d();
                    }),
                    removePatches: s("removePatches", (o) => {
                        ("string" == typeof o && o) || e(`Mod ${r} failed to patch a function: Expected function name string, got ${typeof o}`);
                        const t = l(o);
                        c(t).patches.clear(), d();
                    }),
                    callOriginal: s("callOriginal", (o, t, n) => {
                        ("string" == typeof o && o) || e(`Mod ${r} failed to call a function: Expected function name string, got ${typeof o}`);
                        const i = l(o);
                        return (
                            Array.isArray(t) || e(`Mod ${r} failed to call a function: Expected args array, got ${typeof t}`),
                            i.original.apply(null != n ? n : globalThis, t)
                        );
                    }),
                    getOriginalHash: s("getOriginalHash", (o) => {
                        ("string" == typeof o && o) || e(`Mod ${r} failed to get hash: Expected function name string, got ${typeof o}`);
                        return l(o).originalHash;
                    }),
                },
                g = {
                    name: o.name,
                    fullName: o.fullName,
                    version: o.version,
                    repository: o.repository,
                    allowReplace: i,
                    api: p,
                    loaded: !0,
                    patching: new Map(),
                };
            return f.set(o.name, g), Object.freeze(p);
        }
        function h() {
            const o = [];
            for (const e of f.values()) o.push({ name: e.name, fullName: e.fullName, version: e.version, repository: e.repository });
            return o;
        }
        let m;
        const y =
            void 0 === window.bcModSdk
                ? (window.bcModSdk = (function () {
                      const e = {
                          version: o,
                          apiVersion: 1,
                          registerMod: g,
                          getModsInfo: h,
                          getPatchingInfo: p,
                          errorReporterHooks: Object.seal({
                              apiEndpointEnter: null,
                              hookEnter: null,
                              hookChainExit: null,
                          }),
                      };
                      return (m = e), Object.freeze(e);
                  })())
                : (n(window.bcModSdk) || e("Failed to init Mod SDK: Name already in use"),
                  1 !== window.bcModSdk.apiVersion && e(`Failed to init Mod SDK: Different version already loaded ('1.2.0' vs '${window.bcModSdk.version}')`),
                  window.bcModSdk.version !== o &&
                      alert(
                          `Mod SDK warning: Loading different but compatible versions ('1.2.0' vs '${window.bcModSdk.version}')\nOne of mods you are using is using an old version of SDK. It will work for now but please inform author to update`
                      ),
                  window.bcModSdk);
        return "undefined" != typeof exports && (Object.defineProperty(exports, "__esModule", { value: !0 }), (exports.default = y)), y;
    })();
    const MOD_NAME = "LMK";
    const MOD_FULL_NAME = "Lillys Markings";
    const MOD_VERSION = "0.1.0";
    const MOD_REPOSITORY = "";
    const mod = bcModSdk.registerMod({
        name: MOD_NAME,
        fullName: MOD_FULL_NAME,
        version: MOD_VERSION,
        repository: MOD_REPOSITORY,
    });
    let menuElements = {
        LMKSettings: [],
    };
    let loggedIn = false;

    loginListener();
    async function loginListener() {
        while ((!window.CurrentScreen || window.CurrentScreen == "Login") && !loggedIn) {
            await new Promise((r) => setTimeout(r, 2000));
        }

        loggedIn = true;

        if (!Player.OnlineSettings.LMK) {
            console.log("No LMK settings found, initializing with default values");
            Player.OnlineSettings.LMK = {
                positionX: 0,
                positionY: 0,
                opacity: 100,
                priority: 10,
            };
        }

        if (!Player.OnlineSharedSettings.LMK) {
            Player.OnlineSharedSettings.LMK = Player.OnlineSettings.LMK;
        }
    }

    function addMenuInput(width, text, setting, identifier, hint, type = "text", xModifier = 0, yModifier = 0) {
        menuElements["LMKSettings"].push({
            type: "Input",
            yPos: getNewYPos(),
            width: width,
            text: text,
            setting: setting,
            identifier: identifier,
            hint: hint,
            xModifier: xModifier,
            yModifier: yModifier,
        });
        ElementCreateInput(identifier, type, Player.OnlineSettings.LMK[setting], "100");
        document.getElementById(identifier).addEventListener("input", function () {
            let element = menuElements["LMKSettings"].find((e) => e.identifier === identifier)
            Player.OnlineSettings.LMK[element.setting] = ElementValue(element.identifier);
            Player.OnlineSharedSettings.LMK = Player.OnlineSettings.LMK || {};
            CharacterRefresh(Player, false);
        });
    }

    function drawMenuElements() {
        DrawCharacter(Player, 50, 50, 0.9);
        DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png");
        DrawButton(231, 820, 90, 90, "", "White", "Icons/Naked.png");
        MainCanvas.textAlign = "left";
        DrawText("- LMK Settings -", 500, 125, "Black", "Gray");
        if (!playerList.includes(Player.MemberNumber)) {
            DrawText("You are not marked.", 500, 200, "Red", "Gray");
            DrawText("Please reach out to Luke (131937) if you wish to change that", 500, 300, "Red", "Gray");
            DrawText("or to Lilly (35598) if you did talk to Luke already", 500, 350, "Red", "Gray");
        }

        MainCanvas.textAlign = "left";
        if (PreferenceMessage != "") DrawText(PreferenceMessage, 1400, 125, "Red", "Black");
        // DrawText("LMK " + ubcSettingCategoryLabels[UBCPreferenceSubscreen] + " - Click on a setting to get more info", 500, 125, "Black", "Gray");

        let currentElement;
        let MENU_ELEMENT_X_OFFSET = 1050;
        for (let i = 0; i < menuElements["LMKSettings"].length; i++) {
            currentElement = menuElements["LMKSettings"][i];
            MainCanvas.textAlign = "left";
            let textColor = "Black";
            if (eval(currentElement?.grayedOutReference) === true) textColor = "Gray";
            if (MouseIn(500, currentElement.yPos - 18, MENU_ELEMENT_X_OFFSET - 525, 36)) textColor = "Yellow";
            DrawText(currentElement.text, 500, currentElement.yPos, textColor, "Gray");
            switch (currentElement.type) {
                case "Input":
                    ElementPosition(
                        currentElement.identifier,
                        MENU_ELEMENT_X_OFFSET + currentElement.xModifier + currentElement.width / 2,
                        currentElement.yPos,
                        currentElement.width
                    );
                    break;
                default:
                    break;
            }
        }
    }

    function getNewYPos() {
        let yPos = 200;
        if (menuElements["LMKSettings"].length > 0) {
            let lastElement = menuElements["LMKSettings"][menuElements["LMKSettings"].length - 1];
            yPos = lastElement.yPos + lastElement.yModifier + 75;
        }
        return yPos;
    }
    settingsPage();

    async function settingsPage() {
        let CharacterAppearanceBackup;
        let PlayerNaked = false;
        await waitFor(() => !!PreferenceSubscreenList);
        PreferenceRegisterExtensionSetting({
            Identifier: "LMK",
            ButtonText: "LMK Settings",
            Image: undefined,
            load: PreferenceSubscreenLMKSettingsLoad,
            click: PreferenceSubscreenLMKSettingsClick,
            run: PreferenceSubscreenLMKSettingsRun,
            exit: PreferenceSubscreenLMKSettingsExit,
        });
        function PreferenceSubscreenLMKSettingsRun() {
            drawMenuElements();
        }
        function PreferenceSubscreenLMKSettingsExit() {
            for (let i = 0; i < menuElements["LMKSettings"].length; i++) {
                if (menuElements["LMKSettings"][i].type === "Input") {
                    ElementRemove(menuElements["LMKSettings"][i].identifier);
                }
            }
            Player.OnlineSharedSettings.LMK = Player.OnlineSettings.LMK || {};
            menuElements["LMKSettings"] = [];
            CharacterAppearanceRestore(Player, CharacterAppearanceBackup);
            CharacterRefresh(Player, false);
            PreferenceSubscreenExtensionsClear();
        }
        function PreferenceSubscreenLMKSettingsClick() {
            if (MouseIn(231, 820, 90, 90)) {
                if (PlayerNaked) {
                    CharacterAppearanceRestore(Player, CharacterAppearanceBackup);
                    PlayerNaked = false;
                } else {
                    CharacterAppearanceNaked(Player);
                    PlayerNaked = true;
                }
            }
            if (MouseIn(1815, 75, 90, 90)) PreferenceSubscreenLMKSettingsExit();
        }
        function PreferenceSubscreenLMKSettingsLoad() {
            CharacterAppearanceBackup = CharacterAppearanceStringify(Player);
            console.log("Loading LMK Settings");
            if (playerList.includes(Player.MemberNumber)) {
                addMenuInput(200, "Input Offset on X-Axis (Number, can be negative):", "positionX", "InputPositionX", "", "number", 250);
                addMenuInput(200, "Input Offset on Y-Axis (Number, can be negative):", "positionY", "InputPositionY", "", "number", 250);
                addMenuInput(200, "Input Opacity in % (1-100):", "opacity", "InputOpacity", "", "number", 250);
                addMenuInput(200, "Input Layering Priority (Number, Default 10):", "priority", "InputPriority", "", "number", 250);
            }
        }
    }

    function sleep(ms) {
        // eslint-disable-next-line no-promise-executor-return
        return new Promise((resolve) => window.setTimeout(resolve, ms));
    }
    async function waitFor(func, cancelFunc = () => false) {
        while (!func()) {
            if (cancelFunc()) {
                return false;
            }
            // eslint-disable-next-line no-await-in-loop
            await sleep(10);
        }
        return true;
    }

    const playerList = [33048, 142706, 16361, 167320, 132756, 121031, 143373, 137523, 94934, 178559, 27835, 172579, 132030, 201505];

    mod.patchFunction("CharacterAppearanceSortLayers", {
        "return AssetLayerSort(layers);": `const playerList = ${JSON.stringify(playerList)};
        if (!playerList.includes(C.MemberNumber)) return AssetLayerSort(layers); 
        \n\t\tlet priority = 10;
        \n\t\tif (C && C.OnlineSharedSettings && C.OnlineSharedSettings.LMK) {
        \n\t\t\tpriority = parseInt(C.OnlineSharedSettings.LMK.priority) || 10;
        \n\t\t\tif (Number.isNaN(priority)) priority = 10;
        \n\t\t}
        \n\t\tlayers.push({ Name: "markingLilly", Priority: priority, Asset: { Group: { Name: "BodymarkingsLilly" } } });
        \n\t\treturn AssetLayerSort(layers);`,
    });

    mod.patchFunction("GLDrawLoadImage", {
        "Img.src = url;": 'Img.crossOrigin = "Anonymous";\n\t\tImg.src = url;',
    });

    // @ts-ignore
    mod.hookFunction("CommonDrawAppearanceBuild", 9999, (args, next) => {
        let C = args[0];
        let { clearRect, clearRectBlink, drawCanvas, drawCanvasBlink, drawImage, drawImageBlink, drawImageColorize, drawImageColorizeBlink } = args[1];
        // Loop through all layers in the character appearance
        for (const layer of C.AppearanceLayers) {
            if (layer.Name && layer.Name == "markingLilly") {
                let { X, Y, fixedYOffset } = CommonDrawComputeDrawingCoordinates(
                    C,
                    // @ts-ignore
                    { FixedPosition: false },
                    { DrawingTop: { "": 290 }, DrawingLeft: { "": 74 }, FixedPosition: false },
                    "Bodymarkings"
                );
                let offsetX = 0;
                let offsetY = 0;
                let opacity = 100;
                if (C && C.OnlineSharedSettings && C.OnlineSharedSettings.LMK) {
                    offsetX = parseInt(C.OnlineSharedSettings.LMK.positionX) || 0;
                    if (Number.isNaN(offsetX)) offsetX = 0;
                    offsetY = parseInt(C.OnlineSharedSettings.LMK.positionY) || 0;
                    if (Number.isNaN(offsetY)) offsetY = 0;
                    opacity = parseInt(C.OnlineSharedSettings.LMK.opacity) || 0;
                    if (Number.isNaN(opacity) || opacity < 1 || opacity > 100) opacity = 100;
                }
                drawImage("https://lillybluehair.github.io/BCMarkings/Images/Luke.png", X + offsetX, Y + offsetY, {
                    Alpha: opacity / 100,
                    Invert: false,
                    Mirror: false,
                    BlendingMode: "source-over",
                });
                drawImageBlink("https://lillybluehair.github.io/BCMarkings/Images/Luke.png", X + offsetX, Y + offsetY, {
                    Alpha: opacity / 100,
                    Invert: false,
                    Mirror: false,
                    BlendingMode: "source-over",
                });
                continue;
            }
            const asset = layer.Asset;
            const group = asset.Group;
            let item = C.Appearance.find((i) => i.Asset === asset);
            let groupName = asset.DynamicGroupName;

            // If there's a pose style we must add (items take priority over groups, layers may override completely)
            let pose = CommonDrawResolveAssetPose(C, layer);

            // If the layer belongs to a specific parent group, grab the group's current asset name to use it as a suffix
            let parentAssetName = "";
            const parentGroupName = layer.ParentGroup[pose] ?? layer.ParentGroup[PoseType.DEFAULT];
            if (parentGroupName) {
                const parentItem = C.Appearance.find((Item) => Item.Asset.Group.Name === parentGroupName);
                if (parentItem) parentAssetName = parentItem.Asset.Name;
            }

            // Check if we need to draw a different expression (for facial features)
            const currentExpression = CommonDrawResolveLayerExpression(C, item, layer);
            const expressionSegment = currentExpression ? currentExpression + "/" : "";
            const blinkExpressionSegment = (asset.OverrideBlinking ? !group.DrawingBlink : group.DrawingBlink) ? "Closed/" : expressionSegment;

            // Find the X and Y position to draw on
            let { X, Y, fixedYOffset } = CommonDrawComputeDrawingCoordinates(C, asset, layer, groupName);

            CommonDrawApplyLayerAlphaMasks(C, layer, fixedYOffset, clearRect, clearRectBlink);

            // Check if we need to draw a different variation (from type property)
            const typeRecord = (item.Property && item.Property.TypeRecord) || {};
            let layerSegment = "";
            let layerType = "";
            if (layer.CreateLayerTypes.length > 0) {
                layerType = layer.CreateLayerTypes.map((k) => `${k}${typeRecord[k] || 0}`).join("");
            }
            if (layer.Name) layerSegment = layer.Name;

            let opacity = item.Property && typeof item.Property.Opacity === "number" ? item.Property.Opacity : layer.Opacity;
            if (item.Property && CommonIsArray(item.Property.Opacity)) {
                let Pos = 0;
                if (CommonIsArray(item.Asset.Layer)) {
                    for (let P = 0; P < item.Asset.Layer.length && P < item.Property.Opacity.length; P++) if (layer.Name == item.Asset.Layer[P].Name) Pos = P;
                }
                if (CommonIsNumeric(item.Property.Opacity[Pos])) {
                    opacity = item.Property.Opacity[Pos];
                }
            }
            let blendingMode = layer.BlendingMode;
            opacity = Math.min(layer.MaxOpacity, Math.max(layer.MinOpacity, opacity));
            /** @type {RectTuple[]} */
            let masks = layer.GroupAlpha.filter(({ Pose: P }) => !P || !!CommonDrawFindPose(C, P)).reduce((Acc, { Masks }) => {
                Acc.push(...Masks);
                return Acc;
            }, []);

            // Resolve the layer color; handles color inheritance and schema validation
            let layerColor = CommonDrawResolveLayerColor(C, item, layer, groupName);

            // Before drawing hook, receives all processed data. Any of them can be overriden if returned inside an object.
            // CAREFUL! The dynamic function should not contain heavy computations, and should not have any side effects.
            // Watch out for object references.
            if (asset.DynamicBeforeDraw && (!Player.GhostList || Player.GhostList.indexOf(C.MemberNumber) == -1)) {
                /** @type {DynamicDrawingData} */
                const DrawingData = {
                    C,
                    X,
                    Y,
                    CA: item,
                    GroupName: groupName,
                    Color: layerColor,
                    Opacity: opacity,
                    Property: item.Property,
                    A: asset,
                    G: parentAssetName,
                    AG: group,
                    L: layerSegment,
                    Pose: pose,
                    LayerType: layerType,
                    BlinkExpression: blinkExpressionSegment,
                    drawCanvas,
                    drawCanvasBlink,
                    AlphaMasks: masks,
                    PersistentData: () => AnimationPersistentDataGet(C, asset),
                };
                /** @type {DynamicBeforeDrawOverrides} */
                const OverriddenData = CommonCallFunctionByNameWarn(`Assets${asset.Group.Name}${asset.Name}BeforeDraw`, DrawingData);
                if (typeof OverriddenData === "object") {
                    for (const key in OverriddenData) {
                        switch (key) {
                            case "Property": {
                                item.Property = OverriddenData[key];
                                break;
                            }
                            case "CA": {
                                item = OverriddenData[key];
                                break;
                            }
                            case "GroupName": {
                                groupName = OverriddenData[key];
                                break;
                            }
                            case "Color": {
                                layerColor = OverriddenData[key];
                                break;
                            }
                            case "Opacity": {
                                opacity = OverriddenData[key];
                                break;
                            }
                            case "X": {
                                X = OverriddenData[key];
                                break;
                            }
                            case "Y": {
                                Y = OverriddenData[key];
                                break;
                            }
                            case "LayerType": {
                                layerType = OverriddenData[key];
                                break;
                            }
                            case "L": {
                                layerSegment = OverriddenData[key];
                                break;
                            }
                            case "AlphaMasks": {
                                masks = OverriddenData[key];
                                break;
                            }
                            case "Pose": {
                                pose = OverriddenData[key];
                                break;
                            }
                        }
                    }
                }
            }

            // Safeguard against a null pose
            if (typeof pose !== "string") pose = /** @type {AssetPoseName} */ ("");

            // Redo some checks in case BeforeDraw overrode the color back to default.
            if (layerColor === "Default" && asset.DefaultColor) {
                layerColor = CommonDrawResolveLayerColor(C, item, layer, groupName, layerColor);
            }

            masks = masks.map(([x, y, w, h]) => [x, y + CanvasUpperOverflow + fixedYOffset, w, h]);

            let mirrored = false;
            let inverted = false;
            if (asset.FixedPosition && C.IsInverted()) {
                mirrored = !mirrored;
                inverted = !inverted;
            }

            const itemIsLocked = !!(item.Property && item.Property.LockedBy);

            // Check the current pose against the assets' supported pose mapping
            /** @type {string} */
            let poseSegment = layer.PoseMapping[pose];
            switch (poseSegment) {
                case PoseType.HIDE:
                case PoseType.DEFAULT:
                case undefined:
                    poseSegment = "";
                    break;
                default:
                    poseSegment += "/";
                    break;
            }

            if (layer.HasImage && (!layer.LockLayer || itemIsLocked)) {
                // Handle the layer's color suffix mapping, transforming it back into a named color so we still use the correct base
                /** @type {string | undefined} */
                let colorSuffix = undefined;
                if (layer.ColorSuffix && layerColor) {
                    colorSuffix = layerColor[0] === "#" ? layer.ColorSuffix.HEX_COLOR : layer.ColorSuffix[layerColor];
                    if (colorSuffix && colorSuffix[0] === "#") {
                        layerColor = colorSuffix;
                        colorSuffix = undefined;
                    }
                }

                const baseURL = `Assets/${group.Family}/${groupName}/${poseSegment}${expressionSegment}`;
                const baseURLBlink = `Assets/${group.Family}/${groupName}/${poseSegment}${blinkExpressionSegment}`;

                const shouldColorize = layer.AllowColorize && layerColor && layerColor[0] === "#";
                let colorSegment = "";

                if (shouldColorize) {
                    // The layer is colorizable and has an explicit hexcode, it needs to be drawn colorized
                    colorSegment = colorSuffix != undefined ? colorSuffix : "";
                } else {
                    // The layer isn't colorizable, so validate that the layer color is a named color
                    // If a color suffix is specified and isn't Default, it'll completely override the final color
                    if (layerColor != null && layerColor !== "Default" && layerColor[0] !== "#") {
                        colorSegment = layerColor;
                    }
                    if (colorSuffix) {
                        colorSegment = colorSuffix !== "Default" ? colorSuffix : "";
                    }
                }

                const urlParts = [asset.Name, parentAssetName, layerType, colorSegment, layerSegment].filter((c) => c);
                const layerURL = urlParts.join("_") + ".png";
                if (shouldColorize) {
                    drawImageColorize(baseURL + layerURL, X, Y, {
                        HexColor: layerColor,
                        FullAlpha: asset.FullAlpha,
                        AlphaMasks: masks,
                        Alpha: opacity,
                        Invert: inverted,
                        Mirror: mirrored,
                        BlendingMode: blendingMode,
                    });
                    drawImageColorizeBlink(baseURLBlink + layerURL, X, Y, {
                        HexColor: layerColor,
                        FullAlpha: asset.FullAlpha,
                        AlphaMasks: masks,
                        Alpha: opacity,
                        Invert: inverted,
                        Mirror: mirrored,
                        BlendingMode: blendingMode,
                    });
                } else {
                    drawImage(baseURL + layerURL, X, Y, { AlphaMasks: masks, Alpha: opacity, Invert: inverted, Mirror: mirrored, BlendingMode: blendingMode });
                    drawImageBlink(baseURLBlink + layerURL, X, Y, {
                        AlphaMasks: masks,
                        Alpha: opacity,
                        Invert: inverted,
                        Mirror: mirrored,
                        BlendingMode: blendingMode,
                    });
                }
            }

            // After drawing hook, receives all processed data.
            // CAREFUL! The dynamic function should not contain heavy computations, and should not have any side effects.
            // Watch out for object references.
            if (asset.DynamicAfterDraw && (!Player.GhostList || Player.GhostList.indexOf(C.MemberNumber) == -1)) {
                /** @type {DynamicDrawingData} */
                const DrawingData = {
                    C,
                    X,
                    Y,
                    CA: item,
                    GroupName: groupName,
                    Property: item.Property,
                    Color: layerColor,
                    Opacity: opacity,
                    A: asset,
                    G: parentAssetName,
                    AG: group,
                    L: layerSegment,
                    Pose: pose,
                    LayerType: layerType,
                    BlinkExpression: blinkExpressionSegment,
                    drawCanvas,
                    drawCanvasBlink,
                    AlphaMasks: masks,
                    PersistentData: () => AnimationPersistentDataGet(C, asset),
                };
                CommonCallFunctionByNameWarn(`Assets${asset.Group.Name}${asset.Name}AfterDraw`, DrawingData);
            }
        }
    });
})();
