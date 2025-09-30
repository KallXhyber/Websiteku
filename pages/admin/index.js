// pages/admin/index.js
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, UserCheck, XCircle, Clock, ListOrdered, Check, X, Gamepad2, PlusCircle, Edit, Trash2, Monitor } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../utils/firebase';
import { supabase } from '../../utils/supabase';
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

// --- Komponen Modal Verifikasi ---
const VerificationModal = ({ request, onClose }) => {
  if (!request) return null;
  const handleApprove = async () => { try { await updateDoc(doc(db, 'verification_requests', request.userId), { status: 'approved' }); await updateDoc(doc(db, 'users', request.userId), { verificationStatus: 'terverifikasi' }); onClose(); } catch (error) { console.error("Error approving verification:", error); } };
  const handleReject = async () => { try { await updateDoc(doc(db, 'verification_requests', request.userId), { status: 'rejected' }); await updateDoc(doc(db, 'users', request.userId), { verificationStatus: 'ditolak' }); onClose(); } catch (error) { console.error("Error rejecting verification:", error); } };
  return React.createElement(motion.div, { className: 'fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[60] p-4', initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
    React.createElement(motion.div, { className: 'bg-discord-dark rounded-lg p-6 w-full max-w-2xl relative text-white', initial: { scale: 0.8 }, animate: { scale: 1 }, exit: { scale: 0.8 } },
      React.createElement('h2', { className: 'text-2xl font-bold mb-4' }, 'Detail Verifikasi'),
      React.createElement('p', { className: 'mb-1' }, React.createElement('strong', null, 'User Email: '), request.userEmail),
      React.createElement('p', { className: 'mb-4 text-sm text-discord-gray' }, `Dikirim pada: ${request.submittedAt ? new Date(request.submittedAt.toDate()).toLocaleString() : 'N/A'}`),
      request.message && React.createElement('blockquote', { className: 'bg-discord-darker p-3 rounded-lg mb-4 text-sm italic' }, `Pesan User: "${request.message}"`),
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center' },
        React.createElement('a', { href: request.discordUrl, target: '_blank', rel: 'noopener noreferrer', className: 'bg-discord-darker p-2 rounded hover:bg-discord-blurple' }, 'Lihat SS Discord'),
        React.createElement('a', { href: request.steamUrl, target: '_blank', rel: 'noopener noreferrer', className: 'bg-discord-darker p-2 rounded hover:bg-discord-blurple' }, 'Lihat SS Steam'),
        React.createElement('a', { href: request.cfxUrl, target: '_blank', rel: 'noopener noreferrer', className: 'bg-discord-darker p-2 rounded hover:bg-discord-blurple' }, 'Lihat SS Cfx.re')
      ),
      React.createElement('div', { className: 'flex justify-end gap-4' },
        React.createElement('button', { onClick: onClose, className: 'py-2 px-4 rounded font-semibold bg-gray-600' }, 'Tutup'),
        React.createElement('button', { onClick: handleReject, className: 'bg-red-600 py-2 px-4 rounded font-semibold flex items-center' }, React.createElement(XCircle, {size:18, className:'mr-2'}), 'Tolak'),
        React.createElement('button', { onClick: handleApprove, className: 'bg-green-600 py-2 px-4 rounded font-semibold flex items-center' }, React.createElement(UserCheck, {size:18, className:'mr-2'}), 'Setujui')
      )
    )
  );
};

// --- Komponen Modal Form Akun ---
const AccountFormModal = ({ account, onClose }) => {
    const { userData } = useAuth();
    const [formData, setFormData] = useState({ gameName: account?.gameName || '', description: account?.description || '', price: account?.price || 0 });
    const [imageFile, setImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setImageFile(e.target.files[0]);
    const handleSubmit = async (e) => {
        e.preventDefault(); setIsLoading(true); setError('');
        try {
            let imageUrl = account?.imageUrl || '';
            if (imageFile) {
                const filePath = `public/${Date.now()}-${imageFile.name}`;
                const { data, error: uploadError } = await supabase.storage.from('account-images').upload(filePath, imageFile);
                if (uploadError) throw uploadError;
                const { data: { publicUrl } } = supabase.storage.from('account-images').getPublicUrl(data.path);
                imageUrl = publicUrl;
            }
            const dataToSave = { ...formData, price: Number(formData.price), imageUrl, adminId: userData.adminId, adminName: userData.displayName || userData.email.split('@')[0], adminWa: userData.whatsapp || '', isSold: account?.isSold || false, updatedAt: serverTimestamp() };
            if (account) { await updateDoc(doc(db, 'game_accounts', account.id), dataToSave); } 
            else { await addDoc(collection(db, 'game_accounts'), { ...dataToSave, createdAt: serverTimestamp() }); }
            onClose();
        } catch (err) { console.error("Error saving account:", err); setError("Gagal menyimpan data."); } 
        finally { setIsLoading(false); }
    };
    return React.createElement(motion.div, { className: 'fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[60] p-4' },
        React.createElement(motion.div, { className: 'bg-discord-dark rounded-lg p-6 w-full max-w-lg relative text-white' },
            React.createElement('h2', { className: 'text-2xl font-bold mb-4' }, account ? 'Edit Akun Game' : 'Tambah Akun Game'),
            React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
                React.createElement('input', { name: 'gameName', value: formData.gameName, onChange: handleChange, placeholder: 'Nama Game', className: 'w-full bg-discord-darker p-2 rounded' }),
                React.createElement('textarea', { name: 'description', value: formData.description, onChange: handleChange, placeholder: 'Deskripsi', className: 'w-full bg-discord-darker p-2 rounded h-24' }),
                React.createElement('input', { name: 'price', type: 'number', value: formData.price, onChange: handleChange, placeholder: 'Harga', className: 'w-full bg-discord-darker p-2 rounded' }),
                React.createElement('input', { type: 'file', accept: 'image/*', onChange: handleFileChange, className: 'w-full text-sm' }),
                error && React.createElement('p', { className: 'text-red-500' }, error),
                React.createElement('div', { className: 'flex justify-end gap-4 mt-4' },
                    React.createElement('button', { type: 'button', onClick: onClose, className: 'bg-gray-600 py-2 px-4 rounded' }, 'Batal'),
                    React.createElement('button', { type: 'submit', disabled: isLoading, className: 'bg-discord-blurple py-2 px-4 rounded' }, isLoading ? 'Menyimpan...' : 'Simpan')
                )
            )
        )
    );
};

// --- Modal Baru: Input Nama Pengguna & Durasi ---
const SetPCUsedModal = ({ onSubmit, onClose }) => {
    const [name, setName] = useState('');
    const [duration, setDuration] = useState(1);
    return React.createElement(motion.div, { className: 'fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[60] p-4', initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
        React.createElement(motion.div, { className: 'bg-discord-dark rounded-lg p-6 w-full max-w-sm text-white', initial: { scale: 0.8 }, animate: { scale: 1 }, exit: { scale: 0.8 } },
            React.createElement('h3', { className: 'text-lg font-bold mb-4' }, 'Atur Status "Digunakan"'),
            React.createElement('div', { className: 'space-y-4' },
                React.createElement('div', null,
                    React.createElement('label', { className: 'text-sm text-discord-gray' }, 'Nama Pengguna'),
                    React.createElement('input', { type: 'text', value: name, onChange: (e) => setName(e.target.value), className: 'w-full bg-discord-darker p-2 rounded mt-1', placeholder: 'Nama...' })
                ),
                React.createElement('div', null,
                    React.createElement('label', { className: 'text-sm text-discord-gray' }, 'Durasi Sewa (Jam)'),
                    React.createElement('input', { type: 'number', value: duration, onChange: (e) => setDuration(Number(e.target.value)), className: 'w-full bg-discord-darker p-2 rounded mt-1', min: '1' })
                )
            ),
            React.createElement('div', { className: 'flex justify-end gap-4 mt-6' },
                React.createElement('button', { onClick: onClose, className: 'bg-gray-600 py-2 px-4 rounded' }, 'Batal'),
                React.createElement('button', { onClick: () => onSubmit(name, duration), className: 'bg-discord-blurple py-2 px-4 rounded' }, 'Simpan')
            )
        )
    );
};

// --- Komponen Manajemen PC ---
const PCManagement = () => {
    const [pcSlots, setPcSlots] = useState([]);
    const [isInputModalOpen, setInputModalOpen] = useState(false);
    const [selectedPcId, setSelectedPcId] = useState(null);
    useEffect(() => {
        const q = query(collection(db, 'pc_slots'));
        const unsubscribe = onSnapshot(q, (snapshot) => setPcSlots(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
        return () => unsubscribe();
    }, []);
    const handleStatusChange = (id, newStatus) => {
        if (newStatus === 'DIGUNAKAN') { setSelectedPcId(id); setInputModalOpen(true); } 
        else { updateDoc(doc(db, 'pc_slots', id), { status: newStatus, currentUser: null, startTime: null, durationHours: null }); }
    };
    const handleUserInputSubmit = async (userName, durationHours) => {
        if (userName && durationHours > 0 && selectedPcId) { await updateDoc(doc(db, 'pc_slots', selectedPcId), { status: 'DIGUNAKAN', currentUser: userName, startTime: serverTimestamp(), durationHours: durationHours }); }
        setInputModalOpen(false); setSelectedPcId(null);
    };
    return React.createElement('div', null,
        React.createElement(AnimatePresence, null, isInputModalOpen && React.createElement(SetPCUsedModal, { onClose: () => setInputModalOpen(false), onSubmit: handleUserInputSubmit })),
        React.createElement('h2', { className: 'text-2xl font-bold mb-4 flex items-center' }, React.createElement(Monitor, { size: 20, className: 'mr-2' }), 'Status Slot PC'),
        React.createElement('div', { className: 'bg-black/20 border border-discord-darker p-4 rounded-lg space-y-3' },
            pcSlots.map(pc => React.createElement('div', { key: pc.id, className: 'bg-discord-darker p-3 rounded-lg flex justify-between items-center' },
                React.createElement('div', null,
                    React.createElement('p', { className: 'font-bold' }, pc.slotId),
                    React.createElement('p', { className: `text-sm ${pc.status === 'READY' ? 'text-green-400' : pc.status === 'DIGUNAKAN' ? 'text-yellow-400' : 'text-gray-400'}` }, pc.status)
                ),
                React.createElement('select', { value: pc.status, onChange: (e) => handleStatusChange(pc.id, e.target.value), className: 'bg-discord-dark text-white rounded p-1 text-sm' },
                    React.createElement('option', { value: 'READY' }, 'Ready'),
                    React.createElement('option', { value: 'DIGUNAKAN' }, 'Digunakan'),
                    React.createElement('option', { value: 'OFFLINE' }, 'Offline')
                )
            ))
        )
    );
};

// --- HALAMAN ADMIN UTAMA ---
export default function AdminPage() {
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('transactions');
    const [verifRequests, setVerifRequests] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [gameAccounts, setGameAccounts] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isAccountModalOpen, setAccountModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);

    useEffect(() => {
        if (!loading) { if (!user) { router.push('/login'); } else if (userData?.role !== 'admin') { router.push('/'); } }
    }, [user, userData, loading, router]);
    useEffect(() => {
        if (userData?.role !== 'admin') return;
        const q = query(collection(db, 'verification_requests'), where('status', '==', 'pending'));
        const unsubscribe = onSnapshot(q, (snapshot) => setVerifRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
        return () => unsubscribe();
    }, [userData]);
    useEffect(() => {
        if (userData?.role !== 'admin' || !userData?.adminId) return;
        const q = query(collection(db, "transactions"), where("adminId", "==", userData.adminId));
        const unsubscribe = onSnapshot(q, (snapshot) => setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
        return () => unsubscribe();
    }, [userData]);
    useEffect(() => {
        if (userData?.role !== 'admin') return;
        const q = query(collection(db, 'game_accounts'));
        const unsubscribe = onSnapshot(q, (snapshot) => setGameAccounts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
        return () => unsubscribe();
    }, [userData]);

    const handleTransactionStatus = async (id, newStatus) => { await updateDoc(doc(db, 'transactions', id), { status: newStatus }); };
    const handleDeleteAccount = async (id) => { if (confirm("Yakin ingin menghapus produk ini?")) { await deleteDoc(doc(db, "game_accounts", id)); } };
    
    if (loading || !userData || userData.role !== 'admin') { return React.createElement('div', { className: 'flex justify-center items-center h-screen' }, 'Memverifikasi akses admin...'); }

    const pendingTransactions = transactions.filter(tx => tx.status === 'menunggu konfirmasi');
    const activeTransactions = transactions.filter(tx => tx.status === 'aktif');
    
    const renderTabContent = () => {
        switch (activeTab) {
            case 'transactions':
                return React.createElement(motion.div, { key: 'transactions', initial: { opacity: 0 }, animate: { opacity: 1 } },
                    React.createElement('div', { className: 'mb-8' },
                        React.createElement('h2', { className: 'text-2xl font-bold mb-4 flex items-center' }, React.createElement(Clock, { size: 20, className: 'mr-2' }), 'Menunggu Konfirmasi'),
                        React.createElement('div', { className: 'bg-black/20 border border-discord-darker p-4 rounded-lg space-y-3' },
                            pendingTransactions.length > 0 ? pendingTransactions.map(tx => React.createElement('div', { key: tx.id, className: 'bg-discord-darker p-3 rounded-lg flex justify-between items-center' },
                                React.createElement('div', null, React.createElement('p', { className: 'font-bold' }, tx.userEmail), React.createElement('p', { className: 'text-sm text-discord-gray' }, `Billing: ${tx.billingId}`)),
                                React.createElement('div', { className: 'flex gap-2' }, React.createElement('button', { onClick: () => handleTransactionStatus(tx.id, 'dibatalkan'), className: 'bg-red-600 p-2 rounded' }, React.createElement(X, {size:16})), React.createElement('button', { onClick: () => handleTransactionStatus(tx.id, 'aktif'), className: 'bg-green-600 p-2 rounded' }, React.createElement(Check, {size:16})))
                            )) : React.createElement('p', { className: 'text-discord-gray text-center p-4' }, 'Tidak ada transaksi menunggu.')
                        )
                    ),
                    React.createElement('div', {},
                        React.createElement('h2', { className: 'text-2xl font-bold mb-4 flex items-center' }, React.createElement(ListOrdered, { size: 20, className: 'mr-2' }), 'Transaksi Aktif'),
                         React.createElement('div', { className: 'bg-black/20 border border-discord-darker p-4 rounded-lg space-y-3' },
                            activeTransactions.length > 0 ? activeTransactions.map(tx => React.createElement('div', { key: tx.id, className: 'bg-discord-darker p-3 rounded-lg flex justify-between items-center' },
                                React.createElement('div', null, React.createElement('p', { className: 'font-bold' }, tx.userEmail), React.createElement('p', { className: 'text-sm text-discord-gray' }, `Billing: ${tx.billingId}`)),
                                React.createElement('button', { onClick: () => handleTransactionStatus(tx.id, 'selesai'), className: 'bg-discord-blurple py-2 px-3 rounded text-sm' }, 'Selesaikan')
                            )) : React.createElement('p', { className: 'text-discord-gray text-center p-4' }, 'Tidak ada transaksi aktif.')
                        )
                    )
                );
            case 'pcs': return React.createElement(motion.div, { key: 'pcs', initial: { opacity: 0 }, animate: { opacity: 1 } }, React.createElement(PCManagement, null));
            case 'accounts':
                return React.createElement(motion.div, { key: 'accounts', initial: { opacity: 0 }, animate: { opacity: 1 } },
                    React.createElement('div', { className: 'flex justify-between items-center mb-4' },
                        React.createElement('h2', { className: 'text-2xl font-bold flex items-center' }, React.createElement(Gamepad2, { size: 20, className: 'mr-2' }), 'Produk Akun Game'),
                        React.createElement('button', { onClick: () => { setEditingAccount(null); setAccountModalOpen(true); }, className: 'bg-green-600 text-white py-2 px-4 rounded flex items-center' }, React.createElement(PlusCircle, { size: 18, className: 'mr-2' }), 'Tambah Produk')
                    ),
                    React.createElement('div', { className: 'bg-black/20 border border-discord-darker p-4 rounded-lg space-y-3' },
                        gameAccounts.length > 0 ? gameAccounts.map(acc => React.createElement('div', { key: acc.id, className: 'bg-discord-darker p-3 rounded-lg flex justify-between items-center' },
                            React.createElement('div', null, React.createElement('p', { className: 'font-bold' }, acc.gameName), React.createElement('p', { className: 'text-sm text-discord-gray' }, `Rp ${acc.price.toLocaleString('id-ID')}`)),
                            React.createElement('div', { className: 'flex gap-2' }, React.createElement('button', { onClick: () => { setEditingAccount(acc); setAccountModalOpen(true); }, className: 'bg-blue-600 p-2 rounded' }, React.createElement(Edit, { size: 16 })), React.createElement('button', { onClick: () => handleDeleteAccount(acc.id), className: 'bg-red-600 p-2 rounded' }, React.createElement(Trash2, { size: 16 })))
                        )) : React.createElement('p', { className: 'text-discord-gray text-center p-4' }, 'Belum ada produk akun game.')
                    )
                );
            case 'verifications':
                return React.createElement(motion.div, { key: 'verifications', initial: { opacity: 0 }, animate: { opacity: 1 } },
                    React.createElement('div', { className: 'bg-black/20 border border-discord-darker p-6 rounded-lg' },
                        verifRequests.length > 0 ? React.createElement('div', { className: 'space-y-4' },
                            verifRequests.map(req => React.createElement('div', { key: req.id, className: 'bg-discord-darker p-4 rounded-lg flex justify-between items-center' },
                                React.createElement('div', null, React.createElement('p', { className: 'font-bold' }, req.userEmail), React.createElement('p', { className: 'text-sm text-discord-gray' }, `Dikirim: ${req.submittedAt ? new Date(req.submittedAt.toDate()).toLocaleTimeString() : 'N/A'}`)),
                                React.createElement('button', { onClick: () => setSelectedRequest(req), className: 'bg-discord-blurple py-2 px-4 rounded font-semibold' }, 'Lihat Detail')
                            ))
                        ) : React.createElement('p', { className: 'text-discord-gray text-center' }, 'Tidak ada permintaan verifikasi yang tertunda.')
                    )
                );
            default: return null;
        }
    };
    
    return React.createElement('div', { className: 'container mx-auto px-4 py-8' },
        React.createElement(Head, null, React.createElement('title', null, 'Admin Panel - XyCloud')),
        React.createElement('div', { className: 'flex items-center mb-6' },
            React.createElement(Shield, { className: 'h-8 w-8 text-discord-blurple mr-3' }),
            React.createElement('h1', { className: 'text-3xl font-extrabold' }, 'Admin Panel')
        ),
        React.createElement('div', { className: 'flex border-b border-discord-darker mb-6 flex-wrap' },
            React.createElement('button', { onClick: () => setActiveTab('transactions'), className: `py-2 px-4 font-semibold ${activeTab === 'transactions' ? 'text-white border-b-2 border-discord-blurple' : 'text-discord-gray'}` }, 'Manajemen Transaksi'),
            React.createElement('button', { onClick: () => setActiveTab('pcs'), className: `py-2 px-4 font-semibold ${activeTab === 'pcs' ? 'text-white border-b-2 border-discord-blurple' : 'text-discord-gray'}` }, 'Manajemen PC'),
            React.createElement('button', { onClick: () => setActiveTab('accounts'), className: `py-2 px-4 font-semibold ${activeTab === 'accounts' ? 'text-white border-b-2 border-discord-blurple' : 'text-discord-gray'}` }, 'Manajemen Akun'),
            React.createElement('button', { onClick: () => setActiveTab('verifications'), className: `py-2 px-4 font-semibold ${activeTab === 'verifications' ? 'text-white border-b-2 border-discord-blurple' : 'text-discord-gray'}` }, `Verifikasi User (${verifRequests.length})`)
        ),
        React.createElement(AnimatePresence, { mode: 'wait' }, renderTabContent()),
        React.createElement(AnimatePresence, null, 
            selectedRequest && React.createElement(VerificationModal, { request: selectedRequest, onClose: () => setSelectedRequest(null) }),
            isAccountModalOpen && React.createElement(AccountFormModal, { account: editingAccount, onClose: () => setAccountModalOpen(false) })
        )
    );
}