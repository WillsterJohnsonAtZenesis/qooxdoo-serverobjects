/**
 * Class generated by Qoxodoo Server Objects com.zenesis.qx.remote.ClassWriter
 * 
 * @use(com.zenesis.qx.remote.test.collections.TestRecursiveArray)
 * @use(com.zenesis.qx.remote.collections.ArrayList)
 */

qx.Class.define("com.zenesis.qx.remote.test.collections.TestRecursiveArray", {
  "extend" : qx.core.Object,
  "construct" : function() {
    var args = qx.lang.Array.fromArguments(arguments);
    args.unshift(arguments);
    this.base.apply(this, args);
    this.initialiseProxy();
    this.setChildren(new com.zenesis.qx.remote.collections.ArrayList());
 },
  "destruct" : function() {
    this.setChildren(null);
 },
  "properties" : {
    "children" : {
      "@" : [ new com.zenesis.qx.remote.annotations.Property().set({
  "componentTypeName":"com.zenesis.qx.remote.test.collections.TestRecursiveArray"
}) ],
      "transform":"__transformChildren",
      "nullable" : true,
      "apply":"_applyChildren",
      "check":"com.zenesis.qx.remote.collections.ArrayList",
      "event":"changeChildren"
    },
    "id" : {
      "nullable" : true,
      "apply":"_applyId",
      "check":"String",
      "event":"changeId"
    }
  },
  "members" : {
    "getIdAsync" : function() {
    return qx.Promise.resolve(this.getId()).bind(this);
 },
    "getChildrenAsync" : function() {
    return qx.Promise.resolve(this.getChildren()).bind(this);
 },
    "_applyId" : function(value, oldValue, name) {
    this._applyProperty("id", value, oldValue, name);
 },
    "_applyChildren" : function(value, oldValue, name) {
    this._applyProperty("children", value, oldValue, name);
 },
    "__transformChildren" : function(value) {
    return com.zenesis.qx.remote.MProxy.transformToDataArray(value, com.zenesis.qx.remote.collections.ArrayList);
 }
  },
  "defer" : function(clazz) {
    clazz.$$eventMeta = {};
    clazz.$$methodMeta = {};
    com.zenesis.qx.remote.MProxy.deferredClassInitialisation(clazz);
    qx.lang.Object.mergeWith(clazz.$$properties.children, {
      "onDemand" : false,
      "isServer" : true,
      "arrayClass":"com.zenesis.qx.remote.collections.ArrayList",
      "array":"wrap",
      "readOnly" : false,
      "sync":"queue",
      "nativeKeyType" : true
    });
    qx.lang.Object.mergeWith(clazz.$$properties.id, {
      "onDemand" : false,
      "isServer" : true,
      "readOnly" : false,
      "sync":"queue",
      "nativeKeyType" : true
    });
    clazz.$$eventMeta.changeChildren = {
      "isServer" : true,
      "isProperty" : true
    };
    clazz.$$eventMeta.changeId = {
      "isServer" : true,
      "isProperty" : true
    };
 }
});
