'use strict';

const extend = Object.assign;
function isObject(value) {
    return value != null && typeof value === "object";
}
const hasChange = Object.is;
const hasOwn = (target, property) => {
    return Object.prototype.hasOwnProperty.call(target, property);
};
// 处理 emit key
const camelize = (eventName) => {
    return eventName.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : "";
    });
};
const caplization = (eventName) => {
    return eventName.charAt(0).toUpperCase() + eventName.slice(1);
};
const toHandleKey = (eventName) => {
    return eventName ? "on" + caplization(eventName) : "";
};

let DEEP_WEAKMAP = new WeakMap();
let ACTIVE_EFFECT = null;
class Deep {
    constructor() {
        this.effects = new Set();
    }
    append() {
        if (ACTIVE_EFFECT) {
            ACTIVE_EFFECT._deep = this;
            this.effects.add(ACTIVE_EFFECT);
        }
    }
    notify() {
        this.effects.forEach((e) => {
            if (e.scheduler) {
                e.scheduler();
            }
            else {
                e.run();
            }
        });
    }
}
class ReactiveEffect {
    constructor(_fn, scheduler) {
        this._fn = _fn;
        this.scheduler = scheduler;
    }
    run() {
        // TODO:
        ACTIVE_EFFECT = this;
        const res = this._fn();
        ACTIVE_EFFECT = null;
        return res;
    }
    stop() {
        var _a;
        if ((_a = this._deep) === null || _a === void 0 ? void 0 : _a.effects.has(this)) {
            this._deep.effects.delete(this);
        }
    }
}
// 需要响应的函数
function effect(_fn, options = {}) {
    const _effect = new ReactiveEffect(_fn, options.scheduler);
    extend(_effect, options);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}
// 添加依赖
function track(target, key) {
    const deep = getDeep(target, key);
    deep.append();
}
// 触发依赖
function trigget(target, key) {
    const deep = getDeep(target, key);
    deep.notify();
}
// 查询到指定的 deep
function getDeep(target, key) {
    let map = DEEP_WEAKMAP.get(target);
    if (!map) {
        map = new Map();
        DEEP_WEAKMAP.set(target, map);
    }
    let deep = map.get(key);
    if (!deep) {
        deep = new Deep();
        map.set(key, deep);
    }
    return deep;
}

var ReactiveFlag;
(function (ReactiveFlag) {
    ReactiveFlag["IS_REACTIVE"] = "__v_isReactive";
    ReactiveFlag["IS_READONLY"] = "__v_isReadonly";
})(ReactiveFlag || (ReactiveFlag = {}));

const get = createGetting();
const set = createSetting();
function createGetting(isReadonly = false) {
    return function get(target, key, receiver) {
        if (key === ReactiveFlag.IS_READONLY) {
            return isReadonly;
        }
        else if (key === ReactiveFlag.IS_REACTIVE) {
            return !isReadonly;
        }
        const res = Reflect.get(target, key, receiver);
        if (!isReadonly) {
            // 依赖收集
            track(target, key);
            return res;
        }
    };
}
function createSetting() {
    return function set(target, key, value, receiver) {
        const res = Reflect.set(target, key, value, receiver);
        trigget(target, key);
        return res;
    };
}
const reactiveHandler = {
    get,
    set,
};

function reactive(raw) {
    return new Proxy(raw, reactiveHandler);
}

var RefFlags;
(function (RefFlags) {
    RefFlags["IS_REF"] = "__v_isRef";
})(RefFlags || (RefFlags = {}));
class RefImpl {
    constructor(value) {
        this._deep = new Deep();
        this._value = convert(value);
    }
    get value() {
        if (!isObject(this._value))
            this._deep.append();
        return this._value;
    }
    set value(newValue) {
        if (!hasChange(newValue, this._value)) {
            this._value = convert(newValue);
            if (!isObject(this._value))
                this._deep.notify();
        }
    }
    get [RefFlags.IS_REF]() {
        return true;
    }
}
function ref(raw) {
    const ref = new RefImpl(raw);
    return ref;
}
function isRef(target) {
    return target[RefFlags.IS_REF] ? true : false;
}
// utils
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function unRef(target) {
    return isRef(target) ? target.value : target;
}
function proxyRefs(target) {
    return new Proxy(target, {
        get(target, key, receiver) {
            return unRef(Reflect.get(target, key, receiver));
        },
        set(target, key, value, receiver) {
            if (isRef(target[key]) && !isRef(value)) {
                return (target[key] = value);
            }
            else {
                return Reflect.set(target, key, value, receiver);
            }
        },
    });
}

var ShapeFlags;
(function (ShapeFlags) {
    ShapeFlags[ShapeFlags["ELEMENT"] = 1] = "ELEMENT";
    ShapeFlags[ShapeFlags["STATEFUL_COMPONENT"] = 2] = "STATEFUL_COMPONENT";
    ShapeFlags[ShapeFlags["TEXT_CHILDREN"] = 4] = "TEXT_CHILDREN";
    ShapeFlags[ShapeFlags["ARRAY_CHILDREN"] = 8] = "ARRAY_CHILDREN";
    ShapeFlags[ShapeFlags["SLOT_CHILDREN"] = 16] = "SLOT_CHILDREN";
})(ShapeFlags || (ShapeFlags = {}));

const Fragment = "fragment";
const Text = "text";
function createVnode(type, props = {}, children) {
    const vnode = {
        type,
        props,
        children,
        el: undefined,
        key: props.key,
        shapeFlag: createShapeFlag(type),
    };
    if (Array.isArray(children)) {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    }
    else if (typeof children === "string") {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    }
    if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT && isObject(children)) {
        vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN;
    }
    return vnode;
}
// 不是 字符串和 object 类型的边界判断 不做了
function createShapeFlag(type) {
    if (isObject(type)) {
        return ShapeFlags.STATEFUL_COMPONENT;
    }
    else {
        return ShapeFlags.ELEMENT;
    }
}

function renderSlot(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === "function") {
            return createVnode(Fragment, null, slot(props));
        }
    }
}

function renderText(text) {
    return createVnode(Text, {}, text);
}

const CreateEmit = function (instance, eventName, payload) {
    const { props } = instance;
    const handleName = toHandleKey(camelize(eventName));
    if (hasOwn(props, handleName)) {
        const handler = props[handleName];
        handler(payload);
    }
};

function initProps(instance, props) {
    instance.props = props;
}

function initSlots(instance, slots) {
    const { shapeFlag } = instance.vnode;
    if (shapeFlag & ShapeFlags.SLOT_CHILDREN) {
        instance.slots = normalizeObjectSlots(slots);
    }
}
function normalizeObjectSlots(slots) {
    const newSlots = {};
    for (const key in slots) {
        const val = slots[key];
        newSlots[key] = (props) => normalizeSlotValue(val(props));
    }
    return newSlots;
}
function normalizeSlotValue(val) {
    return Array.isArray(val) ? val : [val];
}

const instancePropertyMap = {
    $props: (i) => i.props,
    $slots: (i) => i.slots,
};
const proxyHandler = {
    get(target, key, receiver) {
        const { _: instance } = target;
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            const val = setupState[key];
            return val;
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicHandler = instancePropertyMap[key];
        if (publicHandler) {
            return publicHandler(instance);
        }
    },
};

let CURRENT_INSTANCE = null;
function createComponent(vnode, parent) {
    const component = {
        type: vnode.type,
        vnode,
        setupState: {},
        props: {},
        slots: {},
        proxy: {},
        isMounted: false,
        provide: parent ? parent.provide : {},
        parent,
        subTree: {},
        render: () => { },
        emit: null,
    };
    component.emit = CreateEmit.bind(component, component);
    return component;
}
function setupComponent(component) {
    // init props
    initProps(component, component.vnode.props);
    // init slots
    initSlots(component, component.vnode.children);
    setupStatefulComponent(component);
}
function setupStatefulComponent(component) {
    const { type, props, emit } = component;
    const { setup } = type;
    let setupResult;
    if (setup) {
        updateCurrentInstance(component);
        setupResult = setup(props, { emit: emit });
        clearCurrentInstance();
    }
    handleSetupResult(component, setupResult);
}
function handleSetupResult(component, setupResult) {
    if (isObject(setupResult)) {
        component.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(component);
}
function finishComponentSetup(component) {
    const { render } = component.type;
    component.proxy = new Proxy({ _: component }, proxyHandler);
    if (render) {
        component.render = render;
    }
}
// 获取当前的 实例
function currentInstance() {
    return CURRENT_INSTANCE;
}
function updateCurrentInstance(instance) {
    CURRENT_INSTANCE = instance;
}
function clearCurrentInstance() {
    CURRENT_INSTANCE = null;
}

function h(type, props, children) {
    return createVnode(type, props, children);
}

function provide(key, value) {
    var _a;
    const instance = currentInstance();
    let { provide } = instance;
    let parentProvide = (_a = instance.parent) === null || _a === void 0 ? void 0 : _a.provide;
    if (provide === parentProvide) {
        provide = parentProvide = Object.create(parentProvide);
    }
    provide[key] = value;
}
function inject(key, defaultValue) {
    const instance = currentInstance();
    let { provide } = instance;
    if (key in provide) {
        let val = provide[key];
        return val;
    }
    else {
        if (typeof defaultValue === "function") {
            return defaultValue();
        }
        return defaultValue;
    }
}

function createAppApi(render) {
    return function (rootVnode) {
        return {
            mount(rootContainer) {
                if (typeof rootContainer === "string") {
                    const node = document.querySelector(rootContainer);
                    rootContainer = node ? node : rootContainer;
                }
                const node = createVnode(rootVnode);
                render(node, rootContainer);
            },
        };
    };
}

const createRenderer = function (options) {
    const { patchProps: hostPatchProps, insert: hostInsert, setElementText: hostSetElementText, remove: hostRemove, } = options;
    function render(vnode, rootContainer) {
        patch(undefined, vnode, rootContainer, null);
    }
    function patch(n1, n2, container, parentComponent, anchor) {
        const { type, shapeFlag } = n2;
        switch (type) {
            case Fragment:
                processFragment(n2, container, parentComponent);
                break;
            case Text:
                processText(n2, container);
                break;
            default:
                if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(n1, n2, container, parentComponent);
                }
                else if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container, parentComponent, anchor);
                }
                break;
        }
    }
    // 处理组件vnode
    function processComponent(n1, n2, container, parentComponent) {
        if (n1) {
            updateComponent();
        }
        else {
            mountComponent(n2, container, parentComponent);
        }
    }
    // 挂载组件
    function mountComponent(n2, container, parentComponent) {
        const instance = createComponent(n2, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, n2, container);
    }
    // 更新组件
    function updateComponent(n1, n2) {
        console.log("update");
    }
    // 处理 组件内部 虚拟node树
    function setupRenderEffect(instance, initVnode, container, parentComponent) {
        effect(() => {
            const { render, proxy, isMounted } = instance;
            if (!isMounted) {
                const subTree = render.call(proxy);
                if (subTree) {
                    patch(undefined, subTree, container, instance);
                    instance.subTree = subTree;
                    initVnode.el = subTree.el;
                }
                instance.isMounted = true;
            }
            else {
                const { subTree: PreSubTree } = instance;
                const newSubTree = render.call(proxy);
                newSubTree && patch(PreSubTree, newSubTree, container, instance);
            }
        });
    }
    // 处理 element
    function processElement(n1, n2, container, parentComponent, anchor) {
        if (n1) {
            patchElement(n1, n2, container, parentComponent);
        }
        else {
            mountElement(n2, container, anchor);
        }
    }
    // 挂载element
    function mountElement(vnode, container, anchor) {
        const el = document.createElement(vnode.type);
        vnode.el = el;
        const { shapeFlag, children, props } = vnode;
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            hostSetElementText(el, children);
        }
        else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(children, el, null, anchor);
        }
        // props
        for (let key in props) {
            const val = props[key];
            hostPatchProps(el, key, val);
        }
        hostInsert(container, el, anchor);
    }
    // 更新element
    function patchElement(n1, n2, container, parentComponent) {
        const el = (n2.el = n1.el);
        patchChildren(n1, n2, el, parentComponent);
    }
    function patchChildren(n1, n2, container, parentComponent) {
        const { shapeFlag: preShapeFlag } = n1;
        const { shapeFlag } = n2;
        const c1 = n1.children;
        const c2 = n2.children;
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            if (preShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                hostSetElementText(container, c2);
            }
            else if (preShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                unmountChildren(c1);
                hostSetElementText(container, c2);
            }
        }
        else {
            if (preShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                hostSetElementText(container, "");
                mountChildren(c2, container, null);
            }
            else if (preShapeFlag * ShapeFlags.ARRAY_CHILDREN) {
                // array to array
                patchKeyedChildren(c1, c2, container, parentComponent);
            }
        }
    }
    // diff
    function isSomeTypeWithKey(n1, n2) {
        return n1.type === n2.type && n1.key === n2.key;
    }
    function patchKeyedChildren(c1, c2, container, parentComponent) {
        // 获取
        let l1 = c1.length - 1;
        let l2 = c2.length - 1;
        let i = 0;
        // 左侧对比 如果 type 与 key对应将n1 与n2 进行 patch 之后 将i 指向下一个vnode
        // 如果不相同 将退出while循环 找到左侧不同点
        while (i <= l1 && i <= l2) {
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSomeTypeWithKey(n1, n2)) {
                patch(n1, n2, container, parentComponent);
            }
            else {
                break;
            }
            i++;
        }
        // a b
        //     -
        // a b e d
        // 双端对比 将会指向 undefined e, i = 2, l1 = 1, l2 = 3
        // a b c d
        //     -
        // a b e d
        // 双端对比 将会指向 c e, i = 2, l1 = 2, l2 = 2
        // a b c d
        //     -
        // a b
        // 双端对比 将会指向 c undefined, i = 2, l1 = 3, l2 = 1
        // 比较右侧
        while (i <= l2 && i <= l1) {
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSomeTypeWithKey(n1, n2)) {
                patch(n1, n2, container, parentComponent);
            }
            else {
                break;
            }
            l1--;
            l2--;
        }
        // const foo = [
        //   h("div", { key: "A" }, "a"),
        //   h("div", { key: "B" }, "b"),
        //   h("div", { key: "C" }, "c"),
        // ];
        // const bar = [h("div", { key: "A" }, "A"), h("div", { key: "B" }, "B")];
        if (i > l1) {
            // 如果 i 大于老的数组长度
            // a b c e
            //     -
            // a b e d f
            // 双端对比 将会指向 undefined e, i = 2, l1 = 1, l2 = 3
            console.log(l1, l2);
            const nextPos = l2 + 1;
            const vnode = c2[nextPos];
            const anchor = nextPos > l2 ? undefined : vnode.el;
            while (i <= l2) {
                patch(undefined, c2[i], container, parentComponent, anchor);
                i++;
            }
        }
        else if (i > l2) {
            // 如果 i 小于 l1 表示 新的小于旧的
            // 老的比新的少 删除多余的
            while (i <= l1) {
                const n1 = c1[i];
                hostRemove(n1.el);
                i++;
            }
        }
        else {
            let s2 = i;
            // 数据映射
            let keyToNewIndexMap = new Map();
            for (let i = s2; i <= l2; i++) {
                keyToNewIndexMap.set(c2[i].key, i);
            }
        }
    }
    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            let el = children[i].el;
            el && hostRemove(el);
        }
    }
    function mountChildren(children, container, parentComponent, anchor) {
        children.forEach((n) => patch(undefined, n, container, parentComponent, anchor));
    }
    // fragment
    function processFragment(vnode, container, parentComponent) {
        const { children } = vnode;
        console.log(children);
        mountChildren(children, container, parentComponent);
    }
    // text
    function processText(vnode, contaienr) {
        const { children } = vnode;
        const textNode = document.createTextNode(children);
        contaienr.append(textNode);
    }
    return {
        createApp: createAppApi(render),
    };
};

const isOn = (key) => /on[A-Z]/.test(key);
const patchEventName = (key) => {
    return key.charAt(0).toLowerCase() + key.slice(1).toLowerCase();
};
// set element props
function patchProps(el, key, value) {
    const eventName = patchEventName(key);
    if (isOn(key)) {
        el.addEventListener(eventName.slice(2), value);
    }
    else {
        el.setAttribute(key, value);
    }
}
// 插入方法
function insert(container, el, anchor) {
    console.log(container, anchor);
    container.insertBefore(el, anchor || null);
}
// set element text
function setElementText(el, val) {
    el.textContent = val;
}
function remove(child) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
const renderer = createRenderer({
    patchProps,
    insert,
    setElementText,
    remove,
});
function createApp(...arg) {
    return renderer.createApp(...arg);
}

exports.createApp = createApp;
exports.currentInstance = currentInstance;
exports.effect = effect;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.ref = ref;
exports.renderSlot = renderSlot;
exports.renderText = renderText;
