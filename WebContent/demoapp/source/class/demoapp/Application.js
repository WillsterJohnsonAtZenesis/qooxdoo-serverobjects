/* ************************************************************************

   server-objects - a contrib to the Qooxdoo project (http://qooxdoo.org/)

   http://qooxdoo.org

   Copyright:
     2010 Zenesis Limited, http://www.zenesis.com

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     
     This software is provided under the same licensing terms as Qooxdoo,
     please see the LICENSE file in the Qooxdoo project's top-level directory 
     for details.

   Authors:
 * John Spackman (john.spackman@zenesis.com)

 ************************************************************************ */

/* ************************************************************************

 @asset(demoapp/*)

 ************************************************************************ */

/**
 * This is the main application class of your custom application "demoapp"
 * 
 * @ignore(com.zenesis.qx.remote.test.collections.TestJavaUtilArrayContainer)
 * @ignore(com.zenesis.qx.remote.test.collections.TestJavaUtilArrayContainer$Child)
 * @ignore(com.zenesis.qx.remote.test.simple.Pippo)
 * @ignore(com.zenesis.qx.remote.test.properties.TestProperties)
 * 
 */
qx.Class.define("demoapp.Application", {
  extend: qx.application.Standalone,

  /*
   * ****************************************************************************
   * MEMBERS
   * ****************************************************************************
   */

  members: {
    /**
     * This method contains the initial application code and gets called during
     * startup of the application
     * 
     * @ignore(alert)
     * @ignore(com.zenesis.qx.remote.test.simple.Pippo)
     * @ignore(com.zenesis.qx.remote.test.properties.TestProperties)
     */
    main: function() {
      // Call super class
      this.base(arguments);

      qx.log.appender.Native;

      /*
       * -------------------------------------------------------------------------
       * Below is your actual application code...
       * -------------------------------------------------------------------------
       */

      new demoapp.test.DemoTest().testMap();

      var manager = new com.zenesis.qx.remote.ProxyManager("/sampleServlet/ajax", true);
      com.zenesis.qx.remote.LogAppender.install();
      qx.event.GlobalError.setErrorHandler(function(ex) {
        this.error("Unhandled error: " + ex.stack);
      }, this);

      var root = this.getRoot();
      var txtLog = this.__txtLog = new qx.ui.form.TextArea().set({ readOnly: true, minHeight: 400 });
      root.add(txtLog, { left: 0, right: 0, bottom: 0 });
      
      this.log("Testing main");
      this.testMain();
      
      this.log("Testing ArrayLists");
      this.testArrayLists();
      
      this.log("Testing Maps");
      this.testMaps();
      
      this.log("All automated tests passed - now open other browsers to start multi user testing");
      this.testMultiUser();
    },
    
    log: function(msg) {
      var txtLog = this.__txtLog;
      var str = txtLog.getValue()||"";
      str += msg + "\n";
      txtLog.setValue(str);
    },

    
    testMain: function() {
      var manager = com.zenesis.qx.remote.ProxyManager.getInstance();
      var boot = manager.getBootstrapObject();
      var mainTests = boot.getMainTests();

      var dt = mainTests.getTodaysDate();
      dt.setDate(dt.getDate() - 1);
      qx.core.Assert.assertTrue(mainTests.isYesterday(dt), "Dates are not passed correctly");

      qx.core.Assert.assertTrue(mainTests.constructor.myStaticMethod("hello") === "static+hello", "static methods not working");

      var cont = new com.zenesis.qx.remote.test.collections.TestJavaUtilArrayContainer();
      cont.set({
        list: new qx.data.Array(),
        map: new com.zenesis.qx.remote.Map()
      });
      cont.getList().push(new com.zenesis.qx.remote.test.collections.TestJavaUtilArrayContainer$Child().set({
        name: "alpha"
      }));
      cont.getList().push(new com.zenesis.qx.remote.test.collections.TestJavaUtilArrayContainer$Child().set({
        name: "bravo"
      }));
      cont.getList().push(new com.zenesis.qx.remote.test.collections.TestJavaUtilArrayContainer$Child().set({
        name: "charlie"
      }));
      cont.getMap().put("alpha", "one");
      cont.getMap().put("bravo", "two");
      cont.getMap().put("charlie", "three");
      cont.test();

      var pippo1 = new com.zenesis.qx.remote.test.simple.Pippo();
      var result = pippo1.getExampleCode();
      for (var i = 0; i < result.getLength(); i++) {
        this.debug("Pippo #" + i + ": name=" + result.getItem(i).getName());
      }
      qx.core.Assert.assertEquals(2, result.getLength());
      qx.core.Assert.assertEquals("prova1", result.getItem(0).getName());
      qx.core.Assert.assertEquals("prova2", result.getItem(1).getName());

      var pippo2 = new com.zenesis.qx.remote.test.simple.Pippo();
      pippo1.setName("hello");
      pippo2.setName("world");
      var result = mainTests.testPippoArray([ pippo1, pippo2 ]);
      this.debug("testPippoArray: " + result);
      qx.core.Assert.assertEquals("Pippo #0: name=helloPippo #1: name=world", result);
      var testScalars = mainTests.getTestScalars();

      mainTests.waitForMillis(1000, function(result) {
        this.debug("waitForMillis completed, result=" + result);
        qx.core.Assert.assertTrue(this == mainTests);
        qx.core.Assert.assertTrue(result == 1000);
      });

      mainTests.waitForMillis(250, function(result) {
        this.debug("waitForMillis completed, result=" + result);
        qx.core.Assert.assertTrue(this == mainTests);
        qx.core.Assert.assertTrue(result == 250);
      });

      mainTests.waitForMillis(2000, function(result) {
        this.debug("waitForMillis completed, result=" + result);
        qx.core.Assert.assertTrue(this == mainTests);
        qx.core.Assert.assertTrue(result == 2000);
      });

      qx.core.Assert.assertTrue(testScalars.getZero() === 0);
      qx.core.Assert.assertTrue(testScalars.getTrue() === true);
      qx.core.Assert.assertTrue(testScalars.getFalse() === false);
      qx.core.Assert.assertTrue(testScalars.getNullBoolean() === null);
      qx.core.Assert.assertTrue(testScalars.getNullBooleanProperty() === null);
      qx.core.Assert.assertEquals(43, testScalars.getFourtyThree());
      qx.core.Assert.assertEquals(6.7, testScalars.getSixPointSeven());
      qx.core.Assert.assertEquals("Hello World", testScalars.getHelloWorld());
      var names = testScalars.getNames();
      var str = "";
      for (var i = 0; i < names.length; i++) {
        if (i > 0)
          str += ",";
        str += names[i];
      }
      qx.core.Assert.assertEquals("Jack,Jill,Bill,Ben", str);
      qx.core.Assert.assertEquals(25, testScalars.addUp([ 1, 3, 5, 7, 9 ]));
      qx.core.Assert.assertTrue(mainTests.verifyTestScalars(testScalars));

      var tp = mainTests.getTestProperties();
      var numCalls = manager.getNumberOfCalls();
      str = tp.getQueued();
      qx.core.Assert.assertEquals("Server Queued", str);
      tp.setQueued("queued from client");
      qx.core.Assert.assertEquals(numCalls, manager.getNumberOfCalls());
      tp.setImmediate("immediate from client");
      numCalls++;
      qx.core.Assert.assertEquals(numCalls, manager.getNumberOfCalls());

      var tg = mainTests.getTestGroups();
      qx.core.Assert.assertEquals(numCalls, manager.getNumberOfCalls());
      qx.core.Assert.assertEquals(tg.getAlpha(), "Alpha");
      qx.core.Assert.assertEquals(numCalls, manager.getNumberOfCalls());
      qx.core.Assert.assertEquals(tg.getBravo(), "Bravo");
      numCalls++;
      qx.core.Assert.assertEquals(numCalls, manager.getNumberOfCalls());
      qx.core.Assert.assertEquals(tg.getCharlie(), "Charlie");
      qx.core.Assert.assertEquals(numCalls, manager.getNumberOfCalls());
      qx.core.Assert.assertEquals(tg.getDelta(), "Delta");
      numCalls++;
      qx.core.Assert.assertEquals(numCalls, manager.getNumberOfCalls());
      qx.core.Assert.assertEquals(tg.getEcho(), "Echo");
      qx.core.Assert.assertEquals(numCalls, manager.getNumberOfCalls());

      str = tp.getChangeLog();
      this.debug("tp.changeLog = " + str);

      var numChangeDemandString = 0;
      tp.addListener("changeDemandString", function(evt) {
        numChangeDemandString++;
        qx.core.Assert.assertEquals("Hello World", evt.getData());
        qx.core.Assert.assertEquals("MyOnDemandString", evt.getOldData());
      }, this);
      numCalls = manager.getNumberOfCalls();
      qx.core.Assert.assertEquals("MyOnDemandString", tp.getOnDemandString());
      qx.core.Assert.assertEquals(numCalls + 1, manager.getNumberOfCalls());
      qx.core.Assert.assertEquals("MyOnDemandString", tp.getOnDemandString());
      qx.core.Assert.assertEquals(numCalls + 1, manager.getNumberOfCalls());
      qx.core.Assert.assertEquals("MyOnDemandPreload", tp.getOnDemandPreload());
      qx.core.Assert.assertEquals(numCalls + 1, manager.getNumberOfCalls());

      tp.setOnDemandString("Hello World");
      qx.core.Assert.assertEquals(numChangeDemandString, 1);
      qx.core.Assert.assertEquals("Hello World", tp.getOnDemandString());
      qx.core.Assert.assertEquals(numCalls + 1, manager.getNumberOfCalls());

      var watchedStringA = "unknown";
      var watchedChangedA = 0;
      tp.addListener("changeWatchedString", function(evt) {
        watchedStringA = evt.getData();
        watchedChangedA++;
      }, this);
      var watchedStringB = "unknown";
      var watchedChangedB = 0;
      tp.addListener("changeWatchedString", function(evt) {
        watchedStringB = evt.getData();
        watchedChangedB++;
      }, this);
      tp.triggerChangeWatchedString();
      qx.core.Assert.assertEquals(watchedChangedA, 1);
      qx.core.Assert.assertEquals(watchedStringA, "Watched=1");
      qx.core.Assert.assertEquals(watchedChangedB, 1);
      qx.core.Assert.assertEquals(watchedStringB, "Watched=1");
      tp.triggerChangeWatchedString();
      qx.core.Assert.assertEquals(watchedChangedA, 2);
      qx.core.Assert.assertEquals(watchedStringA, "Watched=2");
      qx.core.Assert.assertEquals(watchedChangedB, 2);
      qx.core.Assert.assertEquals(watchedStringB, "Watched=2");

      var someEventFires = 0;
      tp.addListener("someEvent", function(evt) {
        someEventFires++;
      }, this);
      tp.triggerSomeEvent();
      qx.core.Assert.assertEquals(someEventFires, 1);
      tp.triggerSomeEvent();
      qx.core.Assert.assertEquals(someEventFires, 2);

      numCalls = manager.getNumberOfCalls();
      var myTp = new com.zenesis.qx.remote.test.properties.TestProperties();
      myTp.setWatchedString("setByClientMethod");
      qx.core.Assert.assertEquals(numCalls, manager.getNumberOfCalls());
      qx.core.Assert.assertTrue(mainTests.checkNewTestProperties(myTp));
      qx.core.Assert.assertEquals(numCalls + 1, manager.getNumberOfCalls());

      var myTp = new com.zenesis.qx.remote.test.properties.TestProperties();
      myTp.setWatchedString("setByClientProperty");
      mainTests.setClientTestProperties(myTp);
      mainTests.checkClientTestProperties();

      var testEx = mainTests.getTestExceptions();
      var str = testEx.getString();
      try {
        testEx.setString("my client string");
      } catch (ex) {
      }
      qx.core.Assert.assertEquals(str, testEx.getString());

      try {
        testEx.throwException();
        qx.core.Assert.assertTrue(false);
      } catch (ex) {
        this.debug("Caught exception: " + ex);
      }

      var testArr = mainTests.getTestArrays();
      var tmp = testArr.getScalarArray();
      qx.core.Assert.assertTrue(qx.Class.isSubClassOf(tmp.constructor, qx.data.Array), "Expecting instance of qx.data.Array, not "
          + tmp.constructor);
      qx.core.Assert.assertArrayEquals([ "One", "Two", "Three", "Four", "Five" ], tmp.toArray());
      tmp.sort();
      qx.core.Assert.assertTrue(testArr.testScalarArray(tmp.toArray()),
          "testScalarArray failed - the array has not been updated properly");

      var tmp = testArr.getScalarArrayList();
      qx.core.Assert.assertTrue(qx.Class.isSubClassOf(tmp.constructor, qx.data.Array), "Expecting instance of qx.data.Array, not "
          + tmp.constructor);
      qx.core.Assert.assertArrayEquals([ "One", "Two", "Three", "Four", "Five" ], tmp.toArray());
      tmp.sort();
      qx.core.Assert.assertTrue(testArr.testScalarArrayList(tmp.toArray()),
          "testScalarArrayList failed - the array has not been updated properly");

      var tmp = testArr.getObjectArray();
      qx.core.Assert.assertTrue(qx.Class.isSubClassOf(tmp.constructor, qx.data.Array), "Expecting instance of qx.data.Array, not "
          + tmp.constructor);
      for (var i = 0; i < 5; i++)
        qx.core.Assert.assertEquals(tmp.getItem(i).getValue(), i + 1);
      tmp.sort();
      qx.core.Assert.assertTrue(testArr.testObjectArray(tmp.toArray()),
          "testObjectArray failed - the array has not been updated properly");

      var tmp = testArr.getObjectArrayList();
      qx.core.Assert.assertTrue(qx.Class.isSubClassOf(tmp.constructor, qx.data.Array), "Expecting instance of qx.data.Array, not "
          + tmp.constructor);
      for (var i = 0; i < 5; i++)
        qx.core.Assert.assertEquals(tmp.getItem(i).getValue(), i + 1);
      tmp.sort();
      qx.core.Assert.assertTrue(testArr.testObjectArrayList(tmp.toArray()),
          "testObjectArrayList failed - the array has not been updated properly");

      tmp = testArr.getReadOnlyArray();
      tmp.splice(1, 1, "stuff");
      qx.core.Assert.assertTrue(testArr.checkReadOnlyArray(), "read only array is not read only");

      tmp = mainTests.getTestMap();

      var map = tmp.getWrappedStringMap();
      qx.core.Assert.assertEquals("one", map.get("alpha"));
      map.remove("bravo");
      map.put("charlie", "three-changed");
      map.put("delta", "four");
      tmp.checkMapUpdated();

      map = tmp.getUnwrappedStringMap();
      qx.core.Assert.assertEquals("one", map.alpha);

      map = tmp.getWrappedStringMapMethod();
      qx.core.Assert.assertEquals("one", map.get("alpha"));

      map = tmp.getObjectMap();
      qx.core.Assert.assertTrue(!!map.get("alpha"));
      qx.core.Assert.assertEquals("com.zenesis.qx.remote.test.collections.TestJavaUtilMap", map.get("alpha").classname);
      map.put("bravo", map.get("alpha"));
      map.remove("alpha");
      tmp.checkObjectMap();

      map = tmp.getEnumMap();
      map.remove("alpha");
      map.put("charlie", "three");
      tmp.checkEnumMap();
    },

    testArrayLists: function() {
      var boot = com.zenesis.qx.remote.ProxyManager.getInstance().getBootstrapObject();
      var tc = boot.getArrayListTests();
      var arr = tc.getStringArray();
      qx.core.Assert.assertArrayEquals([ "alpha", "bravo", "charlie", "delta", "echo" ], arr.toArray());
      arr.removeAt(2);
      arr.removeAt(2);
      arr.push("foxtrot");
      arr.push("george");
      tc.makeChanges();
      qx.core.Assert.assertArrayEquals([ "alpha", "bravo", "echo", "foxtrot", "george", "henry", "indigo" ], arr.toArray());
    },
    
    testMaps: function() {
      var boot = com.zenesis.qx.remote.ProxyManager.getInstance().getBootstrapObject();
      var mc = boot.getMapTests();
      var map = mc.getStringMap();
      qx.core.Assert.assertEquals(map.getLength(), 5);
      qx.core.Assert.assertEquals(map.get("alpha"), "one");
      qx.core.Assert.assertEquals(map.get("bravo"), "two");
      qx.core.Assert.assertEquals(map.get("charlie"), "three");
      qx.core.Assert.assertEquals(map.get("delta"), "four");
      qx.core.Assert.assertEquals(map.get("echo"), "five");
      map.remove("bravo");
      map.remove("delta");
      map.put("alpha", "first");
      mc.makeChanges();
      qx.core.Assert.assertEquals(map.getLength(), 5);
      qx.core.Assert.assertFalse(map.containsKey("bravo"));
      qx.core.Assert.assertFalse(map.containsKey("delta"));
      qx.core.Assert.assertEquals(map.get("alpha"), "first again");
      qx.core.Assert.assertEquals(map.get("foxtrot"), "six");
      qx.core.Assert.assertEquals(map.get("george"), "seven");
    },
    
    testMultiUser: function() {
      var t = this;
      var manager = com.zenesis.qx.remote.ProxyManager.getInstance();
      var boot = manager.getBootstrapObject();
      var multiUser = boot.getMultiUser();
      var root = this.getRoot();

      var btnThrash = new qx.ui.form.Button("Start Thrash Test");
      root.add(btnThrash, {
        left: 100,
        top: 125
      });
      btnThrash.addListener("execute", function() {
        var count = 0;
        function test() {
          multiUser.thrashTest(count++);
          if ((count % 100) == 0)
            t.log(count + "...");
          if (count < 2000)
            setTimeout(test, parseInt(Math.random()*100));
        }
        test();
      }, this);
      
      var btnReset = new qx.ui.form.Button("Reset Users");
      root.add(btnReset, {
        left: 100,
        top: 50
      });
      btnReset.addListener("execute", function() {
        multiUser.resetAll();
      }, this);
      
      var btnStart = new qx.ui.form.Button("Start Multiuser Test");
      root.add(btnStart, {
        left: 200,
        top: 50
      });
      btnStart.addListener("execute", function() {
        multiUser.startTest();
      }, this);
      
      var btnUpdate = new qx.ui.form.Button("Update Values").set({ enabled: false });
      root.add(btnUpdate, {
        left: 350,
        top: 50
      });
      btnUpdate.addListener("execute", function() {
        makeChanges();
      }, this);
      
      var cbxAutoUpdate = new qx.ui.form.CheckBox("Auto update values").set({ value: true });
      root.add(cbxAutoUpdate, { left: 350, top: 80 });
      
      var lblNumUsers = new qx.ui.basic.Label("0 Users Ready").set({ allowGrowX: true });
      root.add(lblNumUsers, {
        left: 100,
        top: 20
      });
      
      var status;
      var numCalls = 0;
      
      function checkForReady() {
        status = multiUser.checkReady();
        //t.log("status=" + JSON.stringify(status));
        lblNumUsers.setValue(status.numReady + " Users Ready");
        if (status.yourIndex == 0)
          setTimeout(checkForReady, 500);
        else {
          btnUpdate.setEnabled(true);
          if (cbxAutoUpdate.getValue()) {
            makeChanges();
          }
        }
      }
      
      function arrayToString(arr) {
        var str = "";
        arr.forEach(function(key) {
          if (str.length)
            str += ", ";
          str += key;
        });
        return "[ " + str + " ]";
      }
      
      function mapToString(map) {
        var str = "";
        map.getKeys().forEach(function(key) {
          if (str)
            str += ",\n";
          str += "  " + key + " = " + map.get(key);
        });
        return "{\n" + str + "\n}";
      }
      
      function makeChanges() {
        //syncUsers();
        numCalls = manager.getNumberOfCalls();
        
        t.log("Starting, yourIndex=" + status.yourIndex);
        var index = status.yourIndex - 1;
        var stringMap = multiUser.getStringMap();
        var stringArray = multiUser.getStringArray();
        t.log("stringArray = " + arrayToString(stringArray));
        t.log("stringMap = " + mapToString(stringMap));
        
        var key = stringArray.getItem(index);
        var value = stringMap.get(key);
        stringMap.put(key, value + " by " + status.yourIndex);
        
        qx.core.Assert.assertEquals(numCalls, manager.getNumberOfCalls());
        multiUser.noop();
        
        t.log("stringArray = " + arrayToString(stringArray));
        t.log("stringMap = " + mapToString(stringMap));
        
        function stepTwo() {
          stringArray.remove(key);
          multiUser.noop();
          t.log("stringArray = " + arrayToString(stringArray));
          t.log("stringMap = " + mapToString(stringMap));
        }
        if (cbxAutoUpdate.getValue()) {
          var waitFor = ((status.numReady - (status.yourIndex - 1)) * 1000) + 250;
          t.log("Waiting for " + waitFor + "ms");
          setTimeout(stepTwo, waitFor);
        } else
          stepTwo();
      }
      
      checkForReady();
      
    }
  }
});
