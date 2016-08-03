package com.zenesis.qx.remote;

import java.io.IOException;
import java.lang.reflect.AccessibleObject;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Date;

import org.hamcrest.core.IsAnything;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.jsontype.TypeSerializer;
import com.zenesis.qx.remote.annotations.Annotation;
import com.zenesis.qx.remote.annotations.Annotations;
import com.zenesis.qx.remote.annotations.Remote;
import com.zenesis.qx.remote.collections.HashMap;

public abstract class AbstractProxyProperty implements ProxyProperty {

	// Name of the property
	protected final String name;
	
	// Whether to sync
	protected Remote.Sync sync;
	
	// Whether on demand
	protected boolean onDemand;
	protected String group;
	
	// Any event that gets fired
	protected ProxyEvent event;
	
	// Whether null is a valid value
	protected Boolean nullable;
	
	// Client annotations
	protected ArrayList<String> clientAnno;
	
	// Whether to send exceptions which occur while setting a value received from teh client
	protected Boolean sendExceptions;
	
	// Whether readonly
	protected Boolean readOnly;
	
	// The data type of the property and  (if an array) the component type of the array
	protected MetaClass propertyClass;
	
	// Whether the client should automatically initialise the property (arrays and maps only)
	protected boolean create;

	// ProxyType this is attached to
	private ProxyType proxyType;
	
	public AbstractProxyProperty(String name) {
		super();
		if (name.equals("property"))
			throw new IllegalArgumentException("Cannot have a property called 'property'");
		this.name = name;
	}
	
	public void addClientAnno(Annotation anno) {
		if (anno != null) {
			if (clientAnno == null)
				clientAnno = new ArrayList();
			clientAnno.add(anno.value());
		}
	}
	
	public void addClientAnno(Annotations annos) {
		if (annos != null) {
			if (clientAnno == null)
				clientAnno = new ArrayList();
			for (int i = 0; i < annos.value().length; i++)
				clientAnno.add(annos.value()[i].value());
		}
	}
	
	public void addAnnotations(AccessibleObject obj) {
		this.addClientAnno(obj.getAnnotation(Annotation.class));
		this.addClientAnno(obj.getAnnotation(Annotations.class));
	}
	
	@Override
	public void serialize(JsonGenerator gen, SerializerProvider sp) throws IOException, JsonProcessingException {
		gen.writeStartObject();
		gen.writeStringField("sync", sync.remoteId);
		if (event != null)
			gen.writeStringField("event", event.getName());
		if (onDemand)
			gen.writeBooleanField("onDemand", true);
		if (isReadOnly())
			gen.writeBooleanField("readOnly", true);
		if (create)
			gen.writeBooleanField("create", true);
		if (clientAnno != null) {
			gen.writeArrayFieldStart("anno");
			for (int i = 0; i < clientAnno.size(); i++)
				gen.writeString(clientAnno.get(i));
			gen.writeEndArray();
		}
		
		if (propertyClass != null) {
			Class clazz = propertyClass.getJavaType();
			//if (proxyType.getClazz().getName().equals("TestQsoMap"))
			//	clazz = clazz;
			boolean nullable;
			if (this.nullable == null) {
				if (clazz == Boolean.TYPE || 
					clazz == Character.TYPE || 
					clazz == Byte.TYPE || 
					clazz == Short.TYPE || 
					clazz == Integer.TYPE || 
					clazz == Long.TYPE || 
					clazz == Float.TYPE || 
					clazz == Double.TYPE)
					nullable = false;
				else
					nullable = true;
			} else
				nullable = this.nullable;
			gen.writeBooleanField("nullable", nullable);
				
			if (propertyClass.isMap()) {
				gen.writeBooleanField("map", true);
				if (propertyClass.getKeyClass() != null)
					gen.writeStringField("keyTypeName", translateTypeName(propertyClass.getKeyClass()));
			}
			
			if (propertyClass.isArray() || propertyClass.isCollection() || propertyClass.isMap()) {
				if (!propertyClass.isWrapArray())
					gen.writeStringField("array", "native");
				else
					gen.writeStringField("array", "wrap");
				if (propertyClass.getCollectionClass() != null && Proxied.class.isAssignableFrom(propertyClass.getCollectionClass())) {
					ProxyType type = ProxyTypeManager.INSTANCE.getProxyType((Class<? extends Proxied>)propertyClass.getCollectionClass());
					gen.writeObjectField("arrayClass", type);
				}
				gen.writeStringField("componentTypeName", translateTypeName(clazz));
				
			} else { 
				if (clazz == boolean.class || clazz == Boolean.class)
					gen.writeStringField("check", "Boolean");
				else if (clazz == int.class || clazz == Integer.class)
					gen.writeStringField("check", "Integer");
				else if (clazz == double.class || clazz == Double.class)
					gen.writeStringField("check", "Number");
				else if (clazz == float.class || clazz == Float.class)
					gen.writeStringField("check", "Number");
				else if (clazz == char.class || clazz == String.class)
					gen.writeStringField("check", "String");
				else if (Date.class.isAssignableFrom(clazz))
					gen.writeStringField("check", "Date");
			}
			if (Proxied.class.isAssignableFrom(clazz)) {
				ProxyType type = propertyClass.getProxyType();
				gen.writeObjectField("clazz", type);
			}
		} else {
			gen.writeBooleanField("nullable", true);
		}
		gen.writeEndObject();
	}
	
	private String translateTypeName(Class clazz) {
		if (clazz == boolean.class || clazz == Boolean.class)
			return "Boolean";
		else if (clazz == int.class || clazz == Integer.class)
			return "Integer";
		else if (clazz == double.class || clazz == Double.class)
			return "Number";
		else if (clazz == float.class || clazz == Float.class)
			return "Number";
		else if (clazz == char.class || clazz == String.class)
			return "String";
		else if (Date.class.isAssignableFrom(clazz))
			return "Date";
		if (Proxied.class.isAssignableFrom(clazz))
			return clazz.getName();
		return null;
	}

	/* (non-Javadoc)
	 * @see com.fasterxml.jackson.databind.JsonSerializable#serializeWithType(com.fasterxml.jackson.core.JsonGenerator, com.fasterxml.jackson.databind.SerializerProvider, com.fasterxml.jackson.databind.jsontype.TypeSerializer)
	 */
	@Override
	public void serializeWithType(JsonGenerator gen, SerializerProvider sp, TypeSerializer ts) throws IOException, JsonProcessingException {
		serialize(gen, sp);
	}

	/**
	 * Returns true if this property is readonly
	 * @return
	 */
	@Override
	public boolean isReadOnly() {
		return readOnly != null && readOnly;
	}


	/**
	 * @return the name
	 */
	@Override
	public String getName() {
		return name;
	}

	/**
	 * @return the sync
	 */
	@Override
	public Remote.Sync getSync() {
		return sync;
	}

	/**
	 * @return the event
	 */
	@Override
	public ProxyEvent getEvent() {
		return event;
	}

	/**
	 * @return the nullable
	 */
	@Override
	public boolean isNullable() {
		return nullable;
	}

	/**
	 * @return the onDemand
	 */
	@Override
	public boolean isOnDemand() {
		return onDemand;
	}

	/**
	 * @return the group
	 */
	@Override
	public String getGroup() {
		return group;
	}

	/**
	 * @return the sendExceptions
	 */
	@Override
	public boolean isSendExceptions() {
		return sendExceptions != null && sendExceptions;
	}

	/**
	 * @return the propertyClass
	 */
	@Override
	public MetaClass getPropertyClass() {
		return propertyClass;
	}

	/**
	 * @return the autoClientCreate
	 */
	public boolean isCreate() {
		return create;
	}

	/**
	 * @return the proxyType
	 */
	public ProxyType getProxyType() {
		return proxyType;
	}

	/**
	 * @param proxyType the proxyType to set
	 */
	public void setProxyType(ProxyType proxyType) {
		this.proxyType = proxyType;
	}

}
