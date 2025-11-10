// Firestore operations - direct client access
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Sheep, Order, Admin, InsertSheep, InsertOrder } from "@shared/schema";

const PRIMARY_ADMIN_EMAIL = "bouazzasalah120120@gmail.com";

// ============= SHEEP OPERATIONS =============

export async function getAllSheep(): Promise<Sheep[]> {
  const sheepRef = collection(db, "sheep");
  const q = query(sheepRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
    updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
  } as Sheep));
}

export async function getSheep(id: string): Promise<Sheep | null> {
  const sheepDoc = await getDoc(doc(db, "sheep", id));
  
  if (!sheepDoc.exists()) {
    return null;
  }
  
  const data = sheepDoc.data();
  return {
    id: sheepDoc.id,
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
  } as Sheep;
}

export async function createSheep(data: InsertSheep): Promise<Sheep> {
  const sheepData = {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const docRef = await addDoc(collection(db, "sheep"), sheepData);
  return { id: docRef.id, ...sheepData } as Sheep;
}

export async function updateSheep(id: string, data: InsertSheep): Promise<Sheep> {
  const sheepRef = doc(db, "sheep", id);
  const updatedData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  
  await updateDoc(sheepRef, updatedData);
  
  const updatedDoc = await getDoc(sheepRef);
  const docData = updatedDoc.data();
  return {
    id,
    ...docData,
    createdAt: docData?.createdAt?.toDate?.()?.toISOString() || docData?.createdAt,
    updatedAt: docData?.updatedAt?.toDate?.()?.toISOString() || docData?.updatedAt,
  } as Sheep;
}

export async function deleteSheep(id: string): Promise<void> {
  await deleteDoc(doc(db, "sheep", id));
}

// ============= ORDER OPERATIONS =============

export async function getAllOrders(): Promise<Order[]> {
  const ordersRef = collection(db, "orders");
  const q = query(ordersRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
    updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
  } as Order));
}

export async function createOrder(data: InsertOrder): Promise<Order> {
  const orderData = {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const docRef = await addDoc(collection(db, "orders"), orderData);
  return { id: docRef.id, ...orderData } as Order;
}

export async function updateOrderStatus(id: string, status: Order["status"]): Promise<Order> {
  const orderRef = doc(db, "orders", id);
  const updatedData = {
    status,
    updatedAt: new Date().toISOString(),
  };
  
  await updateDoc(orderRef, updatedData);
  
  const updatedDoc = await getDoc(orderRef);
  const docData = updatedDoc.data();
  return {
    id,
    ...docData,
    createdAt: docData?.createdAt?.toDate?.()?.toISOString() || docData?.createdAt,
    updatedAt: docData?.updatedAt?.toDate?.()?.toISOString() || docData?.updatedAt,
  } as Order;
}

// ============= ADMIN OPERATIONS =============

export async function getAllAdmins(): Promise<Admin[]> {
  const adminsRef = collection(db, "admins");
  const snapshot = await getDocs(adminsRef);
  
  const admins: Admin[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as Admin));
  
  // Add primary admin
  const primaryAdmin: Admin = {
    id: "primary",
    email: PRIMARY_ADMIN_EMAIL,
    role: "primary",
    addedAt: new Date().toISOString(),
  };
  
  return [primaryAdmin, ...admins];
}

export async function addAdmin(email: string, uid: string): Promise<Admin> {
  if (email === PRIMARY_ADMIN_EMAIL) {
    throw new Error("هذا البريد محجوز للمدير الرئيسي");
  }
  
  // Check if admin already exists
  const adminsRef = collection(db, "admins");
  const q = query(adminsRef, where("email", "==", email));
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    throw new Error("هذا المدير موجود بالفعل");
  }
  
  const adminData = {
    email,
    role: "secondary" as const,
    addedAt: new Date().toISOString(),
  };
  
  // Use UID as document ID so we can check admin status easily
  await updateDoc(doc(db, "admins", uid), adminData).catch(async () => {
    // If document doesn't exist, create it
    const docRef = doc(db, "admins", uid);
    await updateDoc(docRef, adminData);
  });
  
  return { id: uid, ...adminData };
}

export async function removeAdmin(id: string): Promise<void> {
  if (id === "primary") {
    throw new Error("لا يمكن حذف المدير الرئيسي");
  }
  
  await deleteDoc(doc(db, "admins", id));
}
