import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const CLIENTS_COLLECTION = 'clients';
const TECH_COLLECTION = 'technicians';

// --- Client Storage ---
// Fetch all clients from Firestore
export const getClients = async () => {
  try {
    const clientsCol = collection(db, CLIENTS_COLLECTION);
    // Fetch all and sort locally if orderBy index is missing
    const snapshot = await getDocs(clientsCol);
    const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return clients.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (e) {
    console.error('Error reading clients from firestore:', e);
    return [];
  }
};

// Save a new client to Firestore
export const saveClient = async (clientData) => {
  try {
    const newClient = {
      ...clientData,
      createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, CLIENTS_COLLECTION), newClient);
    return { id: docRef.id, ...newClient };
  } catch (e) {
    console.error('Error saving client to firestore:', e);
    throw e;
  }
};

// Clear all clients (not fully supported client-side in firestore without iterating)
export const clearClients = async () => {
  console.warn('clearClients not supported in Firestore adapter directly.');
};

// --- Technician Storage ---

export const getTechnicians = async () => {
  try {
    const snapshot = await getDocs(collection(db, TECH_COLLECTION));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error('Error reading technicians from firestore:', e);
    return [];
  }
};

export const registerTechnician = async (techData) => {
  try {
    const techCol = collection(db, TECH_COLLECTION);
    const q = query(techCol, where('firstNameLowercase', '==', techData.firstName.toLowerCase()));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      throw new Error('A technician with this First Name already exists.');
    }

    const newTech = {
      ...techData,
      firstNameLowercase: techData.firstName.toLowerCase(),
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(techCol, newTech);
    return { id: docRef.id, ...newTech };
  } catch (e) {
    console.error('Error registering technician:', e);
    throw e;
  }
};

export const loginTechnician = async (firstName, password) => {
  try {
    const techCol = collection(db, TECH_COLLECTION);
    const q = query(
      techCol, 
      where('firstNameLowercase', '==', firstName.toLowerCase()),
      where('password', '==', password)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error('Invalid First Name or Password.');
    }

    const docData = snapshot.docs[0];
    return { id: docData.id, ...docData.data() };
  } catch (e) {
    console.error('Error logging in technician:', e);
    throw e;
  }
};

export const updateTechnicianPassword = async (techId, newPassword) => {
  try {
    const techRef = doc(db, TECH_COLLECTION, techId);
    await updateDoc(techRef, {
      password: newPassword
    });
  } catch (e) {
    console.error('Error updating technician password:', e);
    throw e;
  }
};
