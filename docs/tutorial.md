# Tutorial / Getting Started By Example
This example uses the “explorer” demo Qooxdoo app and the com.zenesis.qx.remote.explorer package.
## Defining a Java POJO
There is only one basic requirement when defining a POJO on the server – the class or interface must implement com.zenesis.qx.remote.Proxied, after which your methods can be called (synchronously) from the client.  A more useful object will add properties to the class by using the Properties and Property annotations; for example:

``` java
package qsodemo;
public class Person implements Proxied {
	@Property
	private String name;

	public String getName(){
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
}
```

The Property annotation tells the QSO library about the property “name”, that it fires a “changeName” event whenever it is modified, and when QSO copies a Person object from the server to the client, the property value must be delivered at the same time and then cached on the server.  If the server changes the value of the property, it will fire a “changeName” event and QSO will relay the new value to the client.

QSO knows that the “name” property is read-write because there is a setXxxx, but you can have properties with are readonly for the client:

``` java
public class Person implements Proxied {
	 // ...snip... //
	@Property(readOnly=true)
	private int yearOfBirth;

	public int getYearOfBirth() {
		return yearOfBirth;
	}
	public void setYearOfBirth(int yearOfBirth) {
		this.yearOfBirth = yearOfBirth;
	}
}
```

In this example, the yearOfBirth property will be defined on the client and the server, but only code on the server will be able to change it.

**NOTE::** you cannot use the name "property" for the name of a property.

## Properties On Demand
 
Some properties you only want to get on demand, but once they have been fetched the value should be cached on the client.  For example:

``` java
public class Person implements Proxied {
	// ...snip... //
	@Property(onDemand=true)
	private Person[] children;
	public Person[] getChildren() {
		return children;
	}
```

Note the “onDemand=true” on the @Property definition; the getChildren() method will be called the first time that the client tries to access it and the result is then cached on the client.

After the first request, the client will cache the value of the children property until either the server says that the property value has changed, or the client calls <code Javascript>person.expireChildren();</code>

### Notifying the client when server values change

If the server changes a property value that change will be copied to the client by QSO - but you have to tell QSO that the property has changed:

``` java
public class Person implements Proxied {
   @Property
   private String name;

   public String getName(){
      return name;
   }

   public void setName(String name) {
      this.name = ProxyManager.changeProperty(this, "name", name, this.name);
   }
}
```
ProxyManager.changeProperty notifies the client that a property has changed; the first parameter is the object whose property has changed, the second is the name of the property, the third is the new value, and the fourth is the old value.  

Because QSO creates genuine Qooxdoo classes on the client, you can do this on the client:

``` Javascript
  var myPerson = //...snip...//;
  myPerson.addListener("changeName", function(evt) {
    alert("Person changed their name from " + evt.getOldData() + 
      " to " evt.getData());
  });
```

### Collections and Arrays

Properties which are Java Collections need special handling if the property is read-write because QSO needs to know what type of object is stored in the Collection; you need to use @Property.arrayType to specify the type:

``` Java
public class Person implements Proxied {
	// ...snip... //
	@Property(onDemand=true, arrayType=Person.class)
	private ArrayList<Person> siblings;
	public ArrayList<Person> getSiblings() {
		return siblings;
	}
```

(note that even when using generics, ie ArrayList<Person>, you must still provide the arrayType property - the only exception would be if the "siblings" property was read only)

If you define a property as a native array then QSO will produce a native array on the client and if you use a Collection QSO will use qx.data.Array on the client.  You can override this with @Property.array:

``` Java
public class Person implements Proxied {
	// ...snip... //
	@Property(onDemand=true, array=Remote.Array.WRAP)
	private Person[] children;
	public Person[] getChildren() {
		return children;
	}
```

@Property.array can be Remote.Array.WRAP (to force a qx.data.Array on the client), Remote.Array.NATIVE (to force a native Javascript array on the client), or Remote.Array.DEFAULT (to have QSO decide)

### Maps
Since the Github/Apr-2013 release Maps are relayed to the client as an instance of com.zenesis.qx.remote.Map - previously Maps were relayed as ordinary Javascript objects, but this does not allow changes to the object to be detected and relayed back to the server.  If you want to send the map as a native object, @Property.array should be set to Remote.Array.NATIVE.

Also, if the key to a map is an enum you can specify @Property.keyType with the class of the enum, and QSO will translate the enum identifier in both directions.  EG:

``` Java
  public enum MyEnum {
  	AARDVARK, BEETLE
	}

  @Property(arrayType=TestMap.class, keyType=MyEnum.class)
	private HashMap<MyEnum, TestMap> objectMap = new HashMap<TestMap.MyEnum, TestMap>();
```

In that example, the keys on the client will be "aardvark" and "beetle", the values will be instances of TestMap.
### Sending objects back to the server

When you call a server method and pass parameters which are native types (eg number, string) they are simply copied but you can also pass objects which you previously got from the server (eg from the return value from a previous method call); in this case the object is sent back to the server //by reference//, not by copying.

For example, let's add to the MyBootstrap class:

``` Java
public class MyBootstrap implements Proxied {
   @Property
   private Person customer;

   public Person getCustomer() {
      return customer;
   }
   
   @Method
   public boolean isSameCustomer(Person person) {
      return customer == person;
   }
}
```

and then in your Qooxdoo client app, you will be able to do:

``` Javascript
var customer = boot.getCustomer();
qx.core.Assert.assertTrue(boot.isSameCustomer(customer));
```

Note that in MyBootstrap.isSameCustomer() on the server the test is for the exact same object not for just equality (ie "==" as opposed to .equals()); this works because QSO tracks the objects back and forth between the client and server.


### Creating new objects from the client

Often you'll get objects from the client, eg via the bootstrap object but you can also create objects directly on the client:

``` javascript
  var newCustomer = new qsodemo.Person();
  newCustomer.setName("Mr Franklin");
```

QSO holds all changes to properties for as long as possible, only contacting the server when absolutely necessary; new objects created on the client are also queued, so that you are able to set property values before causing a network call.

You can flush the queue at any time by:

``` Javascript
  var manager = new com.zenesis.qx.remote.ProxyManager.getInstance();
  manager.flushQueue();
```

The queue is automatically triggered when a method is called or when an on-demand property is read for the first time.

## Server Example Code (Java)

QSO needs its own URL inside your servlet - for example, if your servlet is at http://localhost/myServlet/ you might choose http://localhost/myServlet/ajax for QSO.  Any requests for that URL should be passed onto QSO:

``` Java
package qsodemo;
public class MyServlet extends HttpServlet {
   protected void doPost(HttpServletRequest request, HttpServletResponse response)
         throws ServletException, IOException {

      String url = request.getPathInfo();
      if ("/ajax".equals(uri)) {
         ProxyManager.handleRequest(request, response, 
               MyBootstrap.class, "someUniqueName", false);
         return;
      }

       // Your code goes here
   }


public class MyBootstrap implements Proxied {
   @Property
   public String myProperty = "My Property";

   @Method
   public String helloWorld() {
      return "Hello World";
   }
}
```

In the call to ProxyManager.handleRequest, the third parameter is the name of a "bootstrap" class that you must provide, and the forth is the a string that uniquely identifies the servlet (typically this would just be the same as your servlet name but in practice any value is fine so long as its unique).

The "bootstrap" class (MyBootstrap in the example) is just like any object you would like to proxy to the client - i.e. it must implement the Proxied interface and any methods and properties that you want to make available on the client must be marked with @Property or @Method.

## Sharing Objects between Sessions
Since the Github/Apr-2013 release, QSo supports sharing objects between clients, where changes to one client in one session appear in other sessions on other clients.  This feature is not enabled by default, and is enabled by passing true as the fifth parameter to ProxyManager.handleRequest.

You can make a tracker shared or unshared at any time by calling ProxyManager.addSyncTracker/removeSyncTracker.

Once a tracker is synchronised, changes to an object by client A will be stored on the client until it has a reason to connect to the server (usually a method call), and those changes will be stored on the server until client B has a reason to connect to the server.  It is not possible to notify client B that it needs to connect to get updates, the client must periodically connect.

One way of doing this is to use a timer, and the c.z.q.r.ProxyManager class on the client provides a helper method for doing just this:

``` javascript
var manager = new com.zenesis.qx.remote.ProxyManager(ajaxUri + "/ajax");
manager.set({ pollServer: true, pollFrequency: 2000 });
```

In the above example, the server will be polled automatically every two seconds.
### Client Code Example (Javascript)

In your client app, add the following:

``` JavaScript
var manager = new com.zenesis.qx.remote.ProxyManager("/myServlet/ajax");	
var boot = manager.getBootstrapObject();
```

The "boot" variable will be an instance of the class MyBootstrap - the server class you gave as the third parameter in the server example code above.  There's nothing more to do - continuing the example, the following code will work:

``` Javascript
  qx.core.Assert.assertTrue(boot.constructor == qsodemo.MyBootstrap.constructor);
  qx.core.Assert.assertEquals("Hello World", boot.helloWorld());
  qx.core.Assert.assertEquals("My Property", boot.getMyProperty());
```

Note the first assert - the client now has it's own Qooxdoo class called qsodemo.MyBootstrap which matches the server side Java class; you didn't have to write the Javascript version, it was created on the client automatically when it was first needed

## Working Examples

QSO includes two sample applications – “demoapp” which aims to test every aspect of QSO and report “All tests passed!” at the end, and “explorer” which is a simple file explorer that can navigate a tree of files, loaded on demand and bound to a Qooxdoo form.

## Trying the examples

In Eclipse, choose File -> Import and select "Existing projects into workspace"; navigate to the folder where you downloaded QSO and select the "demo-webapp" folder
