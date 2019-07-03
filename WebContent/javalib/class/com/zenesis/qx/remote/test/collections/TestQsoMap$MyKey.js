/**
 * Class generated by Qoxodoo Server Objects com.zenesis.qx.remote.ClassWriter
 * 
 */

qx.Class.define("com.zenesis.qx.remote.test.collections.TestQsoMap$MyKey", {
  "extend" : qx.core.Object,
  "construct" : function() {
    var args = qx.lang.Array.fromArguments(arguments);
    args.unshift(arguments);
    this.base.apply(this, args);
    this.initialiseProxy();
 },
  "properties" : {
    "keyId" : {
      "nullable" : true,
      "apply":"_applyKeyId",
      "check":"String",
      "event":"changeKeyId"
    }
  },
  "members" : {
    "_applyKeyId" : function(value, oldValue, name) {
    this._applyProperty("keyId", value, oldValue, name);
 },
    "getKeyIdAsync" : function() {
    return qx.Promise.resolve(this.getKeyId()).bind(this);
 }
  },
  "defer" : function(clazz) {
    clazz.$$eventMeta = {};
    clazz.$$methodMeta = {};
    com.zenesis.qx.remote.MProxy.deferredClassInitialisation(clazz);
    qx.lang.Object.mergeWith(clazz.$$properties.keyId, {
      "onDemand" : false,
      "isServer" : true,
      "readOnly" : false,
      "sync":"queue",
      "nativeKeyType" : true
    });
    clazz.$$eventMeta.changeKeyId = {
      "isServer" : true,
      "isProperty" : true
    };
 }
});
