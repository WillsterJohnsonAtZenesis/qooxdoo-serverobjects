package com.zenesis.qx.remote;

import java.io.IOException;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map.Entry;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.PrettyPrinter;
import com.fasterxml.jackson.core.util.DefaultPrettyPrinter;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;

/**
 * Handles the writing of a class definition
 * 
 */
public class ClassWriter {

	public static final class RawValue {
		public String value;
		
		RawValue(String value) {
			this.value = value;
		}
	}
	
	public class RawValueSerializer extends StdSerializer<RawValue> {
	     
	    public RawValueSerializer() {
	        this(null);
	    }
	   
	    public RawValueSerializer(Class<RawValue> t) {
	        super(t);
	    }
	 
	    @Override
	    public void serialize(RawValue value, JsonGenerator jgen, SerializerProvider provider) 
	    		throws IOException, JsonProcessingException {
	        jgen.writeRawValue(value.value);
	    }
	}
	
	public static final class Function {
		public String code;
		public String[] args;
		
		Function(String...argsAndCode) {
			this.code = argsAndCode[argsAndCode.length - 1];
			this.args = new String[argsAndCode.length - 1];
			System.arraycopy(argsAndCode, 0, this.args, 0, argsAndCode.length - 1);
		}
		
		Function(String[]args, String code) {
			this.code = code;
			this.args = args;
		}
	}
	
	public class FunctionSerializer extends StdSerializer<Function> {
	     
	    public FunctionSerializer() {
	        this(null);
	    }
	   
	    public FunctionSerializer(Class<Function> t) {
	        super(t);
	    }
	 
	    @Override
	    public void serialize(Function value, JsonGenerator jgen, SerializerProvider provider) 
	    		throws IOException, JsonProcessingException {
			DefaultPrettyPrinter pp = (DefaultPrettyPrinter)provider.getConfig().getDefaultPrettyPrinter();
			
	        String str = "function(";
	        for (int i = 0; i < value.args.length; i++) {
	        	if (i != 0)
	        		str += ", ";
	        	str += value.args[i];
	        }
	        str += ") ";
	    	jgen.writeRawValue(str);
	    	pp.writeStartObject(jgen);
	    	String[] lines = value.code.split("\n");
	    	for (String line : lines) {
		    	pp.beforeObjectEntries(jgen);
		    	jgen.writeRaw("  " + line);
	    	}
	    	jgen.writeRaw("\n");
	    	pp.writeEndObject(jgen, 0);

	    }
	}
	
	private final ProxyType proxyType;
	private final HashMap<String, Object> def;
	private final ObjectMapper objectMapper;
	
	public ClassWriter(ProxyType proxyType) {
		this.proxyType = proxyType;
		
		this.objectMapper = new ObjectMapper();
		SimpleModule module = new SimpleModule();
		module.addSerializer(RawValue.class, new RawValueSerializer());
		module.addSerializer(Function.class, new FunctionSerializer());
		objectMapper.registerModule(module);
		
		def = new HashMap<String, Object>();
		method("defer", new Function(new String[] { "statics", "members", "properties" }, 
				"this.$$eventMeta = {};\n" +
        		"this.$$methodMeta = {};\n"));
	}
	
	public void extend(String name) {
		def.put("extend", new RawValue(name));
	}
	
	public void extend(ArrayList<String> names) {
		RawValue[] arr = new RawValue[names.size()];
		for (int i = 0; i < names.size(); i++)
			arr[i] = new RawValue(names.get(i));
		def.put("extend", arr);
	}
	
	public void implement(ArrayList<String> names) {
		RawValue[] arr = new RawValue[names.size()];
		for (int i = 0; i < names.size(); i++)
			arr[i] = new RawValue(names.get(i));
		def.put("implement", arr);
	}
	
	public void patch(ArrayList<String> names) {
		RawValue[] arr = new RawValue[names.size()];
		for (int i = 0; i < names.size(); i++)
			arr[i] = new RawValue(names.get(i));
		def.put("patch", arr);
	}
	
	public void include(ArrayList<String> names) {
		RawValue[] arr = new RawValue[names.size()];
		for (int i = 0; i < names.size(); i++)
			arr[i] = new RawValue(names.get(i));
		def.put("include", arr);
	}
	
	public void event(String name, String type) {
		@SuppressWarnings("unchecked")
		HashMap<String, Object> map = (HashMap<String,Object>)def.get("events");
		if (map == null) {
			map = new HashMap<>();
			def.put("events", map);
		}
		map.put(name, type);
	}
	
	public void member(String name, Object obj) {
		@SuppressWarnings("unchecked")
		HashMap<String, Object> map = (HashMap<String,Object>)def.get("members");
		if (map == null) {
			map = new HashMap<>();
			def.put("members", map);
		}
		map.put(name, obj);
	}

	public void statics(String name, Object obj) {
		@SuppressWarnings("unchecked")
		HashMap<String, Object> map = (HashMap<String,Object>)def.get("statics");
		if (map == null) {
			map = new HashMap<>();
			def.put("statics", map);
		}
		map.put(name, obj);
	}

	public void property(String name, Object obj) {
		@SuppressWarnings("unchecked")
		HashMap<String, Object> map = (HashMap<String,Object>)def.get("properties");
		if (map == null) {
			map = new HashMap<>();
			def.put("properties", map);
		}
		if (name.charAt(0) == '@' && obj instanceof ArrayList) {
			ArrayList<String> src = (ArrayList)obj;
			ArrayList<RawValue> dest = new ArrayList<>();
			for (String str : src)
				dest.add(new RawValue(str));
			map.put(name, dest);
		} else
			map.put(name, obj);
	}
	
	public Function method(String name) {
		Function fn = (Function)def.get(name);
		return fn;
	}
	
	public void method(String name, Function fn) {
		def.put(name, fn);
	}

	public Function method(String name, boolean create) {
		Function fn = (Function)def.get(name);
		if (fn == null && create) {
			fn = new Function("");
			def.put(name, fn);
		}
		return fn;
	}

	public Function method(String name, String[] args) {
		Function fn = (Function)def.get(name);
		if (fn == null && args != null) {
			fn = new Function(args, "");
			def.put(name, fn);
		}
		return fn;
	}

	public ProxyType getProxyType() {
		return proxyType;
	}

	public ObjectMapper getObjectMapper() {
		return objectMapper;
	}
	
	public String objectToString(Object obj) {
		try {
			return objectMapper.writeValueAsString(obj);
		}catch(JsonProcessingException e) {
			throw new IllegalStateException(e.getMessage(), e);
		}
	}
	
	public String getClassCode() throws JsonProcessingException {
		LinkedHashMap<String, Object> map = new LinkedHashMap<>();
		String[] ORDER = new String[] { "extend", "include", "implement", "constructor", "destructor", 
				"properties", "members", "statics", "defer" };
		for (int i = 0; i < ORDER.length; i++) {
			String key = ORDER[i];
			Object value = def.get(key);
			if (value != null) {
				map.put(key, value);
			}
		}
		for (String key : def.keySet()) {
			if (!contains(ORDER, key)) {
				Object value = def.get(key);
				map.put(key, value);
			}
		}
		ObjectWriter ow = objectMapper.writerWithDefaultPrettyPrinter();
		return "qx.Class.define(\"" + proxyType.getClassName() + "\", " + 
				ow.writeValueAsString(map) + ");\n";
	}
	
	private boolean contains(String[] arr, String str) {
		for (int i = 0; i < arr.length; i++)
			if (arr[i].equalsIgnoreCase(str))
				return true;
		return false;
	}
}
