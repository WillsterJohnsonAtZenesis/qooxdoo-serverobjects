/**
 * Class generated by Qoxodoo Server Objects com.zenesis.qx.remote.ClassWriter
 * 
 */

qx.Class.define("com.zenesis.qx.remote.test.serialisation.TestEnumProxied$MyProxiedEnum", {
  "extend" : qx.core.Object,
  "construct" : function() {
    var args = qx.lang.Array.fromArguments(arguments);
    args.unshift(arguments);
    this.base.apply(this, args);
    this.initialiseProxy();
 },
  "defer" : function(clazz) {
    clazz.$$eventMeta = {};
    clazz.$$methodMeta = {};
    com.zenesis.qx.remote.MProxy.deferredClassInitialisation(clazz);
 }
});