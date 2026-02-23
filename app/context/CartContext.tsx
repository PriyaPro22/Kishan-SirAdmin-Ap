'use client';

import { createContext, useContext, useState, useEffect, useMemo, ReactNode, useRef } from 'react';

interface CartItem {
  id: string | number;
  itemKey?: string;
  name: string;
  price: number;
  quantity: number;
  mainId?: string;
  subId?: string | null;
  childKey?: string;
  deepId?: string;
  subDeepId?: string;
  image?: string;
  [key: string]: any;
}

interface CartContextType {
  cartItems: CartItem[];
  totalPrice: number;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string | number) => void;
  deleteFromCart: (id: string | number) => void;
  clearCart: () => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const API = `${baseUrl}/api/cart`;

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  // Ref for debouncing database sync per item
  const syncTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const isSyncing = useRef<{ [key: string]: boolean }>({});
  const pendingSync = useRef<{ [key: string]: { qty: number, itemDetails?: any } | null }>({});

  // 🔥 Interaction Lock: Prevent DB validation from overwriting UI while user is active
  const lastInteraction = useRef<number>(0);

  const getCleanUserId = () => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('userId');
    if (!raw || raw === 'null' || raw === 'undefined') return null;
    return raw;
  };

  const userIdClean = getCleanUserId();

  /* ================= CORE SYNC LOGIC (TRIGGER BASED) ================= */
  const triggerSync = async (itemId: string | number, qty: number, itemDetails?: any) => {
    const idStr = String(itemId);
    if (!userIdClean) return;

    if (isSyncing.current[idStr]) {
      // If already syncing, queue this update to run immediately after
      pendingSync.current[idStr] = { qty, itemDetails };
      return;
    }

    isSyncing.current[idStr] = true;

    try {
      if (qty <= 0) {
        // DELETE CASE
        // If we have an itemKey, delete it. If not, it might not be on server yet.
        // But we should try to find it.
        const existingItem = cartItems.find(i => String(i.id) === idStr); // Use state, as it's the source of truth for keys
        const keyToDelete = existingItem?.itemKey;

        if (keyToDelete) {
          await deleteItem(keyToDelete);
        }
      } else {
        // UPDATE/ADD CASE
        // Check if we have an itemKey
        const existingItem = cartItems.find(i => String(i.id) === idStr);

        if (existingItem?.itemKey) {
          await updateQty(existingItem.itemKey, qty);
        } else if (itemDetails) {
          // New Item - Add it
          const newItemKey = await addNewItem({ ...itemDetails, quantity: qty });
          if (newItemKey) {
            // Update local state with the new key so future updates work
            setCartItems(prev => prev.map(i => String(i.id) === idStr ? { ...i, itemKey: newItemKey } : i));
          }
        }
      }
    } catch (error) {
      console.error("Sync Error for", idStr, error);
      // Optional: Revert UI if sync fails? For now, we keep optimistic UI.
    } finally {
      isSyncing.current[idStr] = false;

      // Process pending sync if any
      if (pendingSync.current[idStr]) {
        const nextSync = pendingSync.current[idStr];
        pendingSync.current[idStr] = null; // Clear queue
        if (nextSync) {
          triggerSync(itemId, nextSync.qty, nextSync.itemDetails);
        }
      }
    }
  };

  const debounceSync = (itemId: string | number, qty: number, itemDetails?: any) => {
    const idStr = String(itemId);

    // 🔥 Interaction Update
    lastInteraction.current = Date.now();

    // Clear existing timer
    if (syncTimers.current[idStr]) {
      clearTimeout(syncTimers.current[idStr]);
    }

    // Set new timer (500ms debounce as requested)
    syncTimers.current[idStr] = setTimeout(() => {
      console.log(`📡 [CartContext] Debounce finished for ${idStr}. Triggering Sync.`);
      triggerSync(idStr, qty, itemDetails);
      delete syncTimers.current[idStr];
    }, 500);
  };

  /* ================= ADD (OPTIMISTIC) ================= */
  const addToCart = (itemIn: Omit<CartItem, 'quantity'>) => {
    // PERFORMANCE LOG: Start
    const tStart = performance.now();
    console.log(`🚀 [CartContext] addToCart CALL. ID: ${itemIn.id} | Timestamp: ${tStart.toFixed(2)}ms`);

    lastInteraction.current = Date.now(); // 🔒 Lock validation

    const idStr = String(itemIn.deepId || itemIn.id || itemIn._id || `item_${Date.now()}`);

    // Calculate Price safely
    const priceStr = String(itemIn.price);
    const cleanPrice = priceStr.replace(/[^0-9.]/g, '');
    const price = parseFloat(cleanPrice) || 0;

    const item: any = { ...itemIn, price, id: idStr };
    let newQty = 1;

    setCartItems(prev => {
      // PERFORMANCE LOG: Inside SetState
      // console.log(`🔄 [CartContext] Inside setCartItems. Prev Length: ${prev.length}`);

      // Find by Exact ID first, then Deep ID (Fuzzy)
      const existing = prev.find(i =>
        String(i.id) === idStr ||
        (i.deepId && item.deepId && String(i.deepId).startsWith(String(item.deepId).split('_')[0]))
      );

      if (existing) {
        newQty = (Number(existing.quantity) || 0) + 1;

        console.log(`⚡ [CartContext] Incrementing Existing. New Qty: ${newQty}. ID: ${existing.id}`);

        // Trigger Sync (Debounced) - Use EXISTING ID to prevent dups
        debounceSync(existing.id, newQty, item);

        return prev.map(i =>
          i.id === existing.id ? { ...i, quantity: newQty } : i
        ) as CartItem[];
      }

      console.log(`✨ [CartContext] Adding NEW Item. ID: ${idStr}`);

      // New Item
      debounceSync(idStr, 1, item);
      return [...prev, { ...item, quantity: 1, id: idStr }] as CartItem[];
    });

    const tEnd = performance.now();
    console.log(`🏁 [CartContext] addToCart DONE. Duration: ${(tEnd - tStart).toFixed(2)}ms`);
  };

  /* ================= REMOVE (OPTIMISTIC) ================= */
  const removeFromCart = (id: string | number) => {
    const tStart = performance.now();
    console.log(`🔻 [CartContext] removeFromCart CALL. ID: ${id} | Timestamp: ${tStart.toFixed(2)}ms`);

    lastInteraction.current = Date.now(); // 🔒 Lock validation

    const idStr = String(id);
    let newQty = 0;

    setCartItems(prev => {
      const existing = prev.find(i =>
        String(i.id) === idStr ||
        (i.deepId && String(i.deepId).startsWith(String(idStr).split('_')[0]))
      );

      if (!existing) {
        console.warn(`⚠️ [CartContext] Remove failed. Item not found: ${idStr}`);
        return prev;
      }

      newQty = (Number(existing.quantity) || 0) - 1;
      console.log(`📉 [CartContext] Decrementing. New Qty: ${newQty}. ID: ${existing.id}`);

      // Schedule sync
      debounceSync(existing.id, newQty);

      if (newQty > 0) {
        return prev.map(i =>
          i.id === existing.id ? { ...i, quantity: newQty } : i
        );
      } else {
        return prev.filter(i => i.id !== existing.id);
      }
    });

    const tEnd = performance.now();
    console.log(`🏁 [CartContext] removeFromCart DONE. Duration: ${(tEnd - tStart).toFixed(2)}ms`);
  };

  /* ================= ABSOLUTE DELETE (LOCAL + DB) ================= */
  const deleteFromCart = (id: string | number) => {
    lastInteraction.current = Date.now();
    const idStr = String(id);

    setCartItems(prev => {
      const existing = prev.find(i => String(i.id) === idStr);
      if (!existing) return prev;

      // Trigger DB Delete
      debounceSync(existing.id, 0);

      return prev.filter(i => i.id !== existing.id);
    });
  };

  /* ================= VALIDATION (POLLING) ================= */
  // Checks DB for deletions/updates every few seconds
  const validateCart = async () => {
    if (!userIdClean) return;

    // 🔥 Strict Check: Don't validate if user interacted recently (< 10s)
    // We increase this to 10s to give the server ample time to catch up.
    // If user is "Active", Local State is KING.
    const isActive = Object.keys(syncTimers.current).length > 0 ||
      Object.values(isSyncing.current).some(v => v) ||
      Object.values(pendingSync.current).some(v => v !== null) ||
      (Date.now() - lastInteraction.current < 10000);

    // If active, we SKIP validation completely. 
    // This solves the '25 -> 1' issue because the server (1) never gets a chance to overwrite Local (25).
    if (isActive) return;

    try {
      const authToken = localStorage.getItem('authToken');
      const apiToken = process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token';

      const res = await fetch(`${API}/${userIdClean}`, {
        headers: {
          'x-api-token': apiToken,
          'Authorization': `Bearer ${authToken}`
        },
        cache: 'no-store'
      });

      const data = await res.json();
      if (!data.success || !data.data) return;

      const serverItemsMap = data.data; // Object of itemObjects keyed by itemKey
      const serverItemsArray = Object.entries(serverItemsMap)
        .map(([key, val]: any) => {
          const normalizedId = String(val.deepId || val.id || val._id || val.itemKey || key);
          return {
            ...val,
            itemKey: key,
            id: normalizedId // Normalize Server ID
          };
        })
        .filter(i => i.id && i.id !== 'undefined' && i.id !== 'null' && i.id !== '[object Object]'); // 🛡️ Strict Filter

      setCartItems(prev => {
        // Double check activity inside the update (in case user clicked while fetch was running)
        if (Date.now() - lastInteraction.current < 10000) {
          console.log("🔒 [CartContext] User active (<10s). Blocking DB overwrite to favor Local state.");
          return prev;
        }

        const newCart: CartItem[] = [...prev];
        const serverItemsHandled = new Set<string>();

        // 🟢 Phase 1: Comparison & Correction (Local is King)
        prev.forEach((localItem, index) => {
          const localIdStr = String(localItem.id);

          // Find this item on the server
          const serverMatch = serverItemsArray.find(sItem =>
            sItem.itemKey === localItem.itemKey ||
            sItem.deepId === localItem.deepId ||
            sItem.id === localIdStr
          );

          if (serverMatch) {
            serverItemsHandled.add(serverMatch.itemKey);
            const serverQty = Number(serverMatch.qty || 0);

            // ⚖️ COMPARE: Local vs Database
            if (serverQty !== localItem.quantity) {
              console.log(`⚖️ [CartSync] Mismatch for ${localItem.name}. Local: ${localItem.quantity}, DB: ${serverQty}`);
              console.log(`🚀 [CartSync] Correcting Database to match Local UI...`);

              // Local is King -> Re-push local quantity to database
              debounceSync(localItem.id, localItem.quantity, localItem);
            } else {
              // Same quantity -> Merge server metadata (price/image updates)
              newCart[index] = {
                ...localItem,
                ...serverMatch,
                quantity: localItem.quantity, // Keep local reference
                id: localIdStr
              };
            }
          } else {
            // Item exists in Local but NOT in DB
            console.log(`⚖️ [CartSync] Item ${localItem.name} missing from DB. Pushing now...`);
            debounceSync(localItem.id, localItem.quantity, localItem);
          }
        });

        // 🔵 Phase 2: Multi-Device Sync (New Server Items)
        serverItemsArray.forEach(sItem => {
          if (!serverItemsHandled.has(sItem.itemKey)) {
            console.log(`📦 [CartSync] New item from Server: ${sItem.name}. Adding to Local.`);
            const normalizedItem: CartItem = {
              id: sItem.id,
              itemKey: sItem.itemKey,
              name: sItem.name || 'Service',
              price: Number(sItem.price),
              quantity: Number(sItem.qty),
              deepId: sItem.deepId,
              subDeepId: sItem.subDeepId,
              mainId: sItem.mainId,
              subId: sItem.subId,
              childKey: sItem.childKey,
              image: sItem.image
            };

            // Check for duplicate IDs before adding
            if (!newCart.find(local => String(local.id) === String(sItem.id))) {
              newCart.push(normalizedItem);
            }
          }
        });

        return newCart;
      });

    } catch (e) {
      // Silent fail
    }
  };

  // Poll for validation every 5 seconds
  useEffect(() => {
    const interval = setInterval(validateCart, 5000);
    return () => clearInterval(interval);
  }, [userIdClean]);


  /* ================= CLEAR ================= */
  const clearCart = async () => {
    setCartItems([]);
    if (!userIdClean) return;

    // Clear all pending timers
    Object.values(syncTimers.current).forEach(clearTimeout);
    syncTimers.current = {};

    try {
      const authToken = localStorage.getItem('authToken');
      const apiToken = process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token';

      await fetch(`${API}/clear/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-api-token': apiToken,
          'Authorization': `Bearer ${authToken}`
        }
      });
    } catch (e) {
      console.error("Error clearing cart", e);
    }
  };

  /* ================= API HELPERS ================= */

  const addNewItem = async (item: any) => {
    const mainId = item.mainId || (typeof window !== 'undefined' ? localStorage.getItem('mainId') : '') || '';
    const subId = item.subId || (typeof window !== 'undefined' ? localStorage.getItem('subId') : '') || '';

    const body = {
      name: item.name,
      price: item.price,
      id: item.id,
      image: item.image || null,
      mainId,
      subId: subId || null,
      childKey: item.childKey || (typeof window !== 'undefined' ? (localStorage.getItem('childKey') || localStorage.getItem('childId')) : '') || 'Service',
      deepId: item.deepId || item.id,
      subDeepId: item.subDeepId || null,
      qty: item.quantity || 1
    };

    const authToken = localStorage.getItem('authToken');
    const apiToken = process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token';

    const res = await fetch(`${API}/add/${userIdClean}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-token': apiToken,
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (data.success && data.data?.itemKey) {
      return data.data.itemKey;
    }
    return null;
  };

  const updateQty = async (itemKey: string, qty: number) => {
    const authToken = localStorage.getItem('authToken');
    const apiToken = process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token';

    await fetch(`${API}/update/${userIdClean}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-api-token': apiToken,
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ itemKey, qty })
    });
  };

  const deleteItem = async (itemKey: string) => {
    const authToken = localStorage.getItem('authToken');
    const apiToken = process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token';

    await fetch(`${API}/remove/${userIdClean}/${itemKey}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-api-token': apiToken,
        'Authorization': `Bearer ${authToken}`
      }
    });
  };

  /* ================= FETCH CART (INITIAL LOAD) ================= */
  const fetchCart = async () => {
    if (!userIdClean) return;

    try {
      const authToken = localStorage.getItem('authToken');
      const apiToken = process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token';

      const res = await fetch(`${API}/${userIdClean}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-token': apiToken,
          'Authorization': `Bearer ${authToken}`
        },
        cache: 'no-store'
      });

      const data = await res.json();
      if (!data.success || !data.data) return;

      let cachedServices: any[] = [];
      if (typeof window !== 'undefined') {
        try {
          const cache = localStorage.getItem('servicesCache');
          if (cache) {
            const parsed = JSON.parse(cache);
            cachedServices = Array.isArray(parsed) ? parsed : Object.values(parsed);
          }
        } catch (e) {
          console.error("Failed to load services cache", e);
        }
      }

      // Convert server data to local item objects
      const serverItems = Object.entries(data.data)
        .map(([key, val]: any) => {
          const id = String(val.deepId || val.id || val._id || val.itemKey || key);
          if (!id || id === 'undefined' || id === 'null' || id === '[object Object]') {
            console.error(`🚨 [CartContext] CRITICAL: Could not determine stable ID for item '${val.name}'. Server data:`, val);
          }

          const cached = cachedServices.find((s: any) =>
            String(s.id) === id || String(s._id) === id || String(s.documentId) === id || String(s.item_id) === id || (s.name === val.name)
          );

          const priceStr = String(val.price);
          const cleanPrice = priceStr.replace(/[^0-9.]/g, '');
          let price = parseFloat(cleanPrice) || 0;

          if (price === 0 && cached && cached.price) {
            price = Number(cached.price) || 0;
          }

          let itemImage = val.image || (cached ? cached.image : null);

          return {
            id: id, // Guaranteed to be string
            itemKey: key,
            name: val.name,
            price: price,
            quantity: Number(val.qty || 1),
            ...val,
            image: itemImage
          };
        })
        .filter(i => i.id && i.id !== 'undefined' && i.id !== 'null') as CartItem[]; // 🛡️ Strict Filter

      // MERGE LOGIC (Crucial for "New User" fast clicking)
      setCartItems(prev => {
        // 🛡️ SANITIZE: Remove any existing bad items from local state first
        const validPrev = prev.filter(i => i.id && String(i.id) !== 'undefined');

        // If user is actively clicking, we must be careful not to overwrite
        const now = Date.now();
        const isActive = (now - lastInteraction.current < 10000);

        if (validPrev.length === 0) return serverItems;

        const newCart: CartItem[] = [];
        const processedServerKeys = new Set<string>();
        const processedOutputIds = new Set<string>(); // ✅ Guard against duplicate IDs in output

        // Helper to safely add to newCart
        const cancelDuplicate = (item: CartItem) => {
          const idStr = String(item.id);
          if (!idStr || idStr === 'undefined' || processedOutputIds.has(idStr)) return;
          processedOutputIds.add(idStr);
          newCart.push(item);
        };

        // 1. Process Local Items (VALID ONES ONLY)
        validPrev.forEach(localItem => {
          const localIdStr = String(localItem.id);
          let match = localItem.itemKey ? serverItems.find(s => s.itemKey === localItem.itemKey) : null;

          // Fuzzy match if no key
          if (!match) {
            match = serverItems.find(s =>
              String(s.deepId) === String(localItem.deepId) ||
              String(s.id) === localIdStr ||
              (localItem.deepId && s.deepId && String(s.deepId).startsWith(String(localItem.deepId)))
            );
          }

          if (match) {
            processedServerKeys.add(match.itemKey!);
            const serverQty = Number(match.quantity || 0);

            // CONFLICT:
            // If Active -> Keep Local (User might be clicking +)
            // But ensure ID is valid!
            if (isActive && localItem.quantity > serverQty) {
              const merged = { ...localItem, id: match.id, itemKey: match.itemKey, deepId: match.deepId };
              cancelDuplicate(merged);
            } else {
              cancelDuplicate(match); // Take Server
            }
          } else {
            // Local Item NOT on Server
            if (isActive) {
              cancelDuplicate(localItem);
            }
          }
        });

        // 2. Add remaining Server Items
        serverItems.forEach(sItem => {
          if (sItem.itemKey && !processedServerKeys.has(sItem.itemKey)) {
            cancelDuplicate(sItem);
          }
        });

        return newCart;
      });

    } catch (e) {
      console.error("Error fetching cart", e);
    } finally {
      setIsLoading(false);
    }
  };

  // 🛡️ GLOBAL SANITIZER: Run periodically to kill ghosts
  useEffect(() => {
    const outputSanitizer = setInterval(() => {
      setCartItems(prev => {
        const invalidItems = prev.filter(i => !i || !i.id || String(i.id) === 'undefined' || String(i.id) === 'null');
        if (invalidItems.length > 0) {
          console.warn(`⚠️ [CartContext] Auto-Purged ${invalidItems.length} invalid items:`, invalidItems.map(i => i?.name || 'Unknown'));
          return prev.filter(i => i && i.id && String(i.id) !== 'undefined' && String(i.id) !== 'null');
        }
        return prev;
      });
    }, 2000);
    return () => clearInterval(outputSanitizer);
  }, []);

  useEffect(() => {
    fetchCart();
    // If no user, we are not loading anything from server
    if (!userIdClean) {
      setIsLoading(false);
    }
  }, [userIdClean]);

  const totalPrice = useMemo(() =>
    cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0),
    [cartItems]);

  return (
    <CartContext.Provider value={{ cartItems, totalPrice, addToCart, removeFromCart, deleteFromCart, clearCart, isLoading }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside provider');
  return ctx;
};
