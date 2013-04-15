/**
 * ************************************************************************
 * 
 *    server-objects - a contrib to the Qooxdoo project that makes server 
 *    and client objects operate seamlessly; like Qooxdoo, server objects 
 *    have properties, events, and methods all of which can be access from
 *    either server or client, regardless of where the original object was
 *    created.
 * 
 *    http://qooxdoo.org
 * 
 *    Copyright:
 *      2010 Zenesis Limited, http://www.zenesis.com
 * 
 *    License:
 *      LGPL: http://www.gnu.org/licenses/lgpl.html
 *      EPL: http://www.eclipse.org/org/documents/epl-v10.php
 *      
 *      This software is provided under the same licensing terms as Qooxdoo,
 *      please see the LICENSE file in the Qooxdoo project's top-level directory 
 *      for details.
 * 
 *    Authors:
 *      * John Spackman (john.spackman@zenesis.com)
 * 
 * ************************************************************************
 */
package com.zenesis.qx.remote;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.jsontype.TypeSerializer;
import com.zenesis.qx.remote.annotations.Remote;

/**
 * Provides a thin wrapper around ProxyType so that serialisation works for arrays
 * 
 * @author "John Spackman <john.spackman@zenesis.com>"
 *
 */
public class ProxyTypeArray implements ProxyType {
	
	private final ProxyTypeImpl type;
	@SuppressWarnings("unused")
	private final Remote.Array array;

	public ProxyTypeArray(ProxyTypeImpl type, Remote.Array array) {
		super();
		this.type = type;
		this.array = array;
	}

	/* (non-Javadoc)
	 * @see com.zenesis.qx.remote.ProxyType#getClassName()
	 */
	@Override
	public String getClassName() {
		return type.getClassName();
	}

	/* (non-Javadoc)
	 * @see com.zenesis.qx.remote.ProxyType#getSuperType()
	 */
	@Override
	public ProxyType getSuperType() {
		return null;
	}

	@Override
	public ProxyEvent getEvent(String eventName) {
		return type.getEvent(eventName);
	}

	@Override
	public Map<String, ProxyEvent> getEvents() {
		return type.getEvents();
	}

	@Override
	public Set<ProxyType> getInterfaces() {
		return type.getInterfaces();
	}

	@Override
	public ProxyMethod[] getMethods() {
		return type.getMethods();
	}

	@Override
	public Map<String, ProxyProperty> getProperties() {
		return type.getProperties();
	}

	@Override
	public boolean isInterface() {
		return type.isInterface();
	}

	@Override
	public boolean isProperty(String name) {
		return type.isProperty(name);
	}

	@Override
	public boolean supportsEvent(String eventName) {
		return type.supportsEvent(eventName);
	}

	@Override
	public void serialize(JsonGenerator gen, SerializerProvider sp) throws IOException, JsonProcessingException {
		type.serialize(gen, sp, Remote.Array.WRAP);
	}

	@Override
	public void serializeWithType(JsonGenerator gen, SerializerProvider sp, TypeSerializer ts) throws IOException, JsonProcessingException {
		serialize(gen, sp);
	}

}