package com.zenesis.qx.remote.collections;

import java.io.IOException;
import java.util.AbstractCollection;
import java.util.AbstractSet;
import java.util.Collection;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import com.fasterxml.jackson.core.JsonGenerator;
import com.zenesis.qx.event.EventManager;
import com.zenesis.qx.remote.Proxied;
import com.zenesis.qx.remote.ProxyManager;
import com.zenesis.qx.remote.annotations.Properties;
import com.zenesis.qx.remote.annotations.SerializeConstructorArgs;
import com.zenesis.qx.utils.ArrayUtils;

@Properties(extend="com.zenesis.qx.remote.Map")
public class HashMap<K,V> extends java.util.HashMap<K,V> implements Proxied {
	
	private static final long serialVersionUID = -7803265903489114209L;

	private final int hashCode;
	private KeySet keySet;
	private Values values;
	private EntrySet entrySet;

	public HashMap() {
		super();
		hashCode = new Object().hashCode();
	}

	public HashMap(int initialCapacity, float loadFactor) {
		super(initialCapacity, loadFactor);
		hashCode = new Object().hashCode();
	}

	public HashMap(int initialCapacity) {
		super(initialCapacity);
		hashCode = new Object().hashCode();
	}

	public HashMap(Map<? extends K, ? extends V> m) {
		super(m);
		hashCode = new Object().hashCode();
	}

	@SerializeConstructorArgs
	public void serializeConstructorArgs(JsonGenerator jgen) throws IOException {
		jgen.writeStartArray();
		for (Entry<K,V> entry : superEntrySet()) {
			jgen.writeStartObject();
			jgen.writeObjectField("key", entry.getKey());
			jgen.writeObjectField("value", entry.getValue());
			jgen.writeEndObject();
		}
		jgen.writeEndArray();
	}
	
	@Override
	public V put(K key, V value) {
		if (ArrayUtils.same(super.get(key), value))
			return value;
		V result = super.put(key, value);
		fire(new MapChangeData().put(key, value, result));
		return result;
	}

	@Override
	public void putAll(Map<? extends K, ? extends V> m) {
		MapChangeData event = new MapChangeData();
		for (Map.Entry e : m.entrySet()) {
			K key = (K)e.getKey();
			V value = (V)e.getValue();
			V oldValue = this.get(key);
			if (!ArrayUtils.same(value, oldValue))
				event.put(key, value, oldValue);
		}
		super.putAll(m);
		fire(event);
	}

	@Override
	public V remove(Object key) {
		if (containsKey(key)) {
			V result = super.remove(key);
			fire(new MapChangeData().remove(key));
			return result;
		}
		return null;
	}
	
	@Override
	public void clear() {
		MapChangeData event = new MapChangeData();
		for (Object key : super.keySet())
			event.remove(key);
		super.clear();
		fire(event);
	}

	@Override
	public Set<K> keySet() {
		if (keySet == null)
			keySet = new KeySet();
		return keySet;
	}
	
	Set<K> superKeySet() {
		return super.keySet();
	}

	@Override
	public Collection<V> values() {
		if (values == null)
			values = new Values();
		return values;
	}
	
	Collection<V> superValues() {
		return super.values();
	}

	@Override
	public Set<Entry<K, V>> entrySet() {
		if (entrySet == null)
			entrySet = new EntrySet();
		return entrySet;
	}
	
	Set<Entry<K, V>> superEntrySet() {
		return super.entrySet();
	}

	@Override
	public int hashCode() {
		return hashCode;
	}

	/**
	 * Fires an event
	 * @param event
	 */
	private void fire(MapChangeData event) {
		if (!event.isEmpty()) {
			EventManager.fireDataEvent(this, "change", event);
			ProxyManager.collectionChanged(this, event);
		}
	}
	
	public static class MapChangeEntry {
		private final Object key;
		private final Object value;
		private final Object oldValue;
		
		public MapChangeEntry(Object key, Object value, Object oldValue) {
			super();
			this.key = key;
			this.value = value;
			this.oldValue = oldValue;
		}

		public Object getKey() {
			return key;
		}

		public Object getValue() {
			return value;
		}

		public Object getOldValue() {
			return oldValue;
		}
	}
	
	public static class MapChangeData extends ChangeData {
		public java.util.ArrayList<MapChangeEntry> put;
		public java.util.ArrayList removed;

		public MapChangeData put(Object key, Object value, Object oldValue) {
			if (put == null)
				put = new java.util.ArrayList(5);
			if (removed != null) {
				Iterator it = removed.iterator();
				while (it.hasNext())
					if (ArrayUtils.same(it.next(), key))
						it.remove();
			}
			put.add(new MapChangeEntry(key, value, oldValue));
			return this;
		}

		public MapChangeData remove(Object key) {
			if (removed == null)
				removed = new java.util.ArrayList(5);
			if (put != null) {
				Iterator<MapChangeEntry> it = put.iterator();
				while (it.hasNext())
					if (ArrayUtils.same(it.next().key, key))
						it.remove();
			}
			removed.add(key);
			return this;
		}

		public java.util.ArrayList<MapChangeEntry> getPut() {
			return put;
		}

		public java.util.ArrayList getRemoved() {
			return removed;
		}
		
		public boolean isEmpty() {
			return (put == null || put.isEmpty()) && (removed == null || removed.isEmpty());
		}
	}

    private abstract class AbstractIterator implements Iterator {
    	protected final Iterator<Entry<K,V>> srcIterator;
    	protected Entry<K,V> last;
    	
		public AbstractIterator() {
			super();
			srcIterator = HashMap.this.superEntrySet().iterator();
		}

		@Override
		public boolean hasNext() {
			return srcIterator.hasNext();
		}

		@Override
		public void remove() {
			srcIterator.remove();
			if (last != null)
				HashMap.this.fire(new MapChangeData().remove(last.getKey()));
		}
    }

    private final class ValueIterator extends AbstractIterator {
		@Override
		public V next() {
			last = srcIterator.next();
			return last != null ? last.getValue() : null;
		}
    }

    private final class KeyIterator extends AbstractIterator {
		@Override
		public K next() {
			last = srcIterator.next();
			return last != null ? last.getKey() : null;
		}
    }

    private final class EntryIterator extends AbstractIterator {
		@Override
		public Entry<K,V> next() {
			last = srcIterator.next();
			return last;
		}
    }

    private final class Values extends AbstractCollection<V> {
    	@Override
        public Iterator<V> iterator() {
            return new ValueIterator();
        }
    	@Override
        public int size() {
            return HashMap.this.size();
        }
    	@Override
        public boolean contains(Object o) {
            return containsValue(o);
        }
    	@Override
        public void clear() {
        	HashMap.this.clear();
        }
    }
    
    private final class KeySet extends AbstractSet<K> {
    	@Override
        public Iterator<K> iterator() {
            return new KeyIterator();
        }
    	@Override
        public int size() {
            return HashMap.this.size();
        }
    	@Override
        public boolean contains(Object o) {
            return containsKey(o);
        }
    	@Override
        public boolean remove(Object o) {
            return HashMap.this.remove(o) != null;
        }
    	@Override
        public void clear() {
            HashMap.this.clear();
        }
    }
    
    private final class EntrySet extends AbstractSet<Map.Entry<K,V>> {
    	@Override
        public Iterator<Map.Entry<K,V>> iterator() {
            return new EntryIterator();
        }
    	@Override
        public boolean contains(Object o) {
            if (!(o instanceof Map.Entry))
                return false;
            Map.Entry<K,V> e = (Map.Entry<K,V>) o;
            for (Entry<K,V> candidate : superEntrySet())
            	if (candidate != null && candidate.equals(e))
            		return true;
            return false;
        }
    	@Override
        public boolean remove(Object o) {
        	Iterator<Entry<K,V>> it = iterator();
        	while (it.hasNext()) {
        		if (it.next().equals(o)) {
        			it.remove();
        			return true;
        		}
        	}
            return false;
        }
    	@Override
        public int size() {
            return HashMap.this.size();
        }
    	@Override
        public void clear() {
            HashMap.this.clear();
        }
    }

}
