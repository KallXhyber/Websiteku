// pages/admin/index.js
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, UserCheck, XCircle, Clock, ListOrdered, Check, X, Gamepad2, PlusCircle, Edit, Trash2, Monitor, AlertCircle, RefreshCcw, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../utils/firebase';
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc, addDoc, deleteDoc, serverTimestamp, increment } from 'firebase/firestore';

// --- Komponen Modal Verifikasi ---
const VerificationModal = ({ request, onClose }) => {
  if (!request) return null;

  const sendNotification = async (title, body) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', request.userId));
        if (userDoc.exists() && userDoc.data().fcmToken) {
            await fetch('/api/sendNotification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: userDoc.data().fcmToken,
                    title: title,
                    body: body
                }),
            });
        }
    } catch (error) {
        console.error("Gagal mengirim notifikasi:", error);
    }
  };

  const handleUpdateStatus = async (status) => {
    try {
      await updateDoc(doc(db, 'verifications', request.id), { status: 'selesai' });
      await updateDoc(doc(db, 'users', request.userId), { verificationStatus: status });
      
      if (status === 'terverifikasi') {
          sendNotification('Verifikasi Berhasil! ✅', 'Akun Anda telah disetujui. Sekarang Anda bisa mulai menyewa PC.');
      } else if (status === 'ditolak') {
          sendNotification('Verifikasi Ditolak ❌', 'Verifikasi akun Anda ditolak. Silakan hubungi admin untuk bantuan.');
      }

      onClose();
    } catch (error) {
      console.error("Gagal memperbarui status verifikasi:", error);
    }
  };

  return React.createElement(motion.div, {
    className: 'fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[60] p-4',
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
    React.createElement('div', { className: 'bg-black/20 border border-discord-darker p-8 rounded-lg w-full max-w-lg text-white' },
      React.createElement('h2', { className: 'text-2xl font-bold mb-4' }, 'Tinjau Permintaan Verifikasi'),
      React.createElement('div', { className: 'space-y-4' },
        React.createElement('div', null, React.createElement('strong', null, 'Nama:'), ' ', request.userName),
        React.createElement('div', null, React.createElement('strong', null, 'Email:'), ' ', request.userEmail),
        React.createElement('div', null, React.createElement('strong', null, 'Discord ID:'), ' ', request.discordId),
        React.createElement('div', null, React.createElement('strong', null, 'PC:'), ' ', request.pcName),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4 mt-4' },
          React.createElement('a', { href: request.discordSsUrl, target: '_blank', rel: 'noopener noreferrer', className: 'block overflow-hidden rounded-lg border border-discord-darker hover:border-discord-blurple transition' },
            React.createElement('img', { src: request.discordSsUrl, alt: 'Discord SS', className: 'w-full h-auto object-cover' })
          ),
          React.createElement('a', { href: request.steamSsUrl, target: '_blank', rel: 'noopener noreferrer', className: 'block overflow-hidden rounded-lg border border-discord-darker hover:border-discord-blurple transition' },
            React.createElement('img', { src: request.steamSsUrl, alt: 'Steam SS', className: 'w-full h-auto object-cover' })
          ),
          React.createElement('a', { href: request.cfxSsUrl, target: '_blank', rel: 'noopener noreferrer', className: 'block overflow-hidden rounded-lg border border-discord-darker hover:border-discord-blurple transition' },
            React.createElement('img', { src: request.cfxSsUrl, alt: 'Cfx.re SS', className: 'w-full h-auto object-cover' })
          )
        )
      ),
      React.createElement('div', { className: 'flex justify-end gap-4 mt-6' },
        React.createElement('button', { onClick: () => handleUpdateStatus('ditolak'), className: 'bg-red-600 py-2 px-4 rounded' }, React.createElement(XCircle, { className: 'inline-block mr-2' }), 'Tolak'),
        React.createElement('button', { onClick: () => handleUpdateStatus('terverifikasi'), className: 'bg-green-600 py-2 px-4 rounded' }, React.createElement(CheckCircle, { className: 'inline-block mr-2' }), 'Setujui')
      )
    )
  );
};

// --- Komponen Modal Akun (Tambah/Edit) ---
const AccountFormModal = ({ account, onClose }) => {
    const [formData, setFormData] = useState({
        gameName: account?.gameName || '',
        price: account?.price || 0,
        description: account?.description || '',
        imageUrl: account?.imageUrl || '',
        adminWa: account?.adminWa || '6283116632566',
        adminName: account?.adminName || 'Kall',
        isAvailable: account?.isAvailable || true,
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (account) {
                await updateDoc(doc(db, 'accounts', account.id), formData);
                alert("Akun berhasil diperbarui!");
            } else {
                await addDoc(collection(db, 'accounts'), { ...formData, createdAt: serverTimestamp() });
                alert("Akun berhasil ditambahkan!");
            }
            onClose();
        } catch (error) {
            console.error("Gagal menyimpan akun:", error);
            alert("Terjadi kesalahan.");
        } finally {
            setIsLoading(false);
        }
    };

    return React.createElement(motion.div, {
      className: 'fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[60] p-4',
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
      React.createElement('div', { className: 'bg-black/20 border border-discord-darker p-8 rounded-lg w-full max-w-lg text-white' },
        React.createElement('h2', { className: 'text-2xl font-bold mb-4' }, account ? 'Edit Akun' : 'Tambah Akun Baru'),
        React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
          React.createElement('input', { type: 'text', name: 'gameName', value: formData.gameName, onChange: handleChange, placeholder: 'Nama Game', required: true, className: 'w-full bg-discord-darker p-3 rounded' }),
          React.createElement('input', { type: 'number', name: 'price', value: formData.price, onChange: handleChange, placeholder: 'Harga', required: true, min: 0, className: 'w-full bg-discord-darker p-3 rounded' }),
          React.createElement('textarea', { name: 'description', value: formData.description, onChange: handleChange, placeholder: 'Deskripsi', required: true, className: 'w-full bg-discord-darker p-3 rounded' }),
          React.createElement('input', { type: 'url', name: 'imageUrl', value: formData.imageUrl, onChange: handleChange, placeholder: 'URL Gambar', required: true, className: 'w-full bg-discord-darker p-3 rounded' }),
          React.createElement('div', { className: 'flex items-center gap-2' },
            React.createElement('input', { type: 'checkbox', id: 'isAvailable', name: 'isAvailable', checked: formData.isAvailable, onChange: handleChange }),
            React.createElement('label', { htmlFor: 'isAvailable' }, 'Tersedia untuk dijual')
          ),
          React.createElement('div', { className: 'flex justify-end gap-4 mt-6' },
            React.createElement('button', { type: 'button', onClick: onClose, className: 'bg-gray-600 py-2 px-4 rounded' }, 'Batal'),
            React.createElement('button', { type: 'submit', disabled: isLoading, className: 'bg-discord-blurple py-2 px-4 rounded' }, isLoading ? 'Menyimpan...' : 'Simpan')
          )
        )
      )
    );
};

// --- Modal Selesaikan Transaksi ---
const CompleteTransactionModal = ({ transaction, onClose }) => {
    const [hoursUsed, setHoursUsed] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [reviewLink, setReviewLink] = useState('');
    
    // --- LOGIKA POIN BARU ---
    const addPointsAndCheckLevel = async () => {
        const pointsToAdd = Math.floor(transaction.harga / 1000) * 100;
        const userRef = doc(db, 'users', transaction.userId);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();
        const currentPoints = userData.points || 0;
        const currentLevel = userData.level || 1;
        let newPoints = currentPoints + pointsToAdd;
        let newLevel = currentLevel;
        const pointsToNextLevel = newLevel * 1000;
        if (newPoints >= pointsToNextLevel) {
            newLevel = newLevel + 1;
        }

        await updateDoc(userRef, {
            points: newPoints,
            level: newLevel
        });
        console.log(`Poin ditambahkan: ${pointsToAdd}. Poin baru: ${newPoints}. Level baru: ${newLevel}`);
    };

    const handleCompleteAndCreateReview = async () => {
        setIsLoading(true);
        try {
            const totalHoursMatch = transaction.paket.match(/(\d+)\s*Jam/);
            const totalHours = totalHoursMatch ? parseInt(totalHoursMatch[1], 10) : 0;
            if (totalHours > 0 && hoursUsed < totalHours) {
                const remainingMinutes = (totalHours - hoursUsed) * 60;
                const userDocRef = doc(db, 'users', transaction.userId);
                await updateDoc(userDocRef, { saldoWaktu: increment(remainingMinutes) });
            }
            await updateDoc(doc(db, 'transactions', transaction.id), { status: 'selesai' });
            await addPointsAndCheckLevel();
            const newReviewDoc = {
                transactionId: transaction.id,
                userId: transaction.userId,
                pcId: transaction.pcId,
                rating: null,
                comment: null,
                timestamp: serverTimestamp(),
                status: 'pending'
            };
            const reviewDocRef = await addDoc(collection(db, 'reviews'), newReviewDoc);
            const link = `${window.location.origin}/review/${reviewDocRef.id}`;
            setReviewLink(link);

        } catch (error) {
            console.error("Gagal menyelesaikan transaksi dan membuat link ulasan:", error);
            alert("Terjadi kesalahan.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCompleteWithoutReview = async () => {
        setIsLoading(true);
        try {
            const totalHoursMatch = transaction.paket.match(/(\d+)\s*Jam/);
            const totalHours = totalHoursMatch ? parseInt(totalHoursMatch[1], 10) : 0;
            if (totalHours > 0 && hoursUsed < totalHours) {
                const remainingMinutes = (totalHours - hoursUsed) * 60;
                const userDocRef = doc(db, 'users', transaction.userId);
                await updateDoc(userDocRef, { saldoWaktu: increment(remainingMinutes) });
            }
            await updateDoc(doc(db, 'transactions', transaction.id), { status: 'selesai' });
            await addPointsAndCheckLevel();
            onClose();
        } catch (error) {
            console.error("Gagal menyelesaikan transaksi:", error);
            alert("Terjadi kesalahan.");
        } finally {
            setIsLoading(false);
        }
    };

    if (reviewLink) {
        return React.createElement(motion.div, { className: 'fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[60] p-4' },
          React.createElement('div', { className: 'bg-black/20 border border-discord-darker p-8 rounded-lg w-full max-w-lg text-white text-center' },
            React.createElement('h2', { className: 'text-2xl font-bold mb-4' }, 'Transaksi Selesai!'),
            React.createElement('p', { className: 'mb-4' }, 'Berikan link ini kepada user untuk mengisi ulasan:'),
            React.createElement('input', { type: 'text', readOnly: true, value: reviewLink, className: 'w-full bg-gray-700 text-white p-2 rounded mb-4' }),
            React.createElement('div', { className: 'flex justify-center gap-4' },
              React.createElement('button', { onClick: () => navigator.clipboard.writeText(reviewLink), className: 'bg-discord-blurple py-2 px-4 rounded' }, 'Salin Link'),
              React.createElement('button', { onClick: onClose, className: 'bg-gray-600 py-2 px-4 rounded' }, 'Tutup')
            )
          )
        );
    }

    return React.createElement(motion.div, {
      className: 'fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[60] p-4',
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
      React.createElement('div', { className: 'bg-black/20 border border-discord-darker p-8 rounded-lg w-full max-w-md text-white' },
        React.createElement('h2', { className: 'text-2xl font-bold mb-4' }, 'Selesaikan Transaksi'),
        React.createElement('p', { className: 'mb-2' }, React.createElement('strong', null, 'User:'), ` ${transaction.userName}`),
        React.createElement('p', { className: 'mb-4' }, React.createElement('strong', null, 'Paket:'), ` ${transaction.paket}`),
        React.createElement('label', { className: 'block mb-2' }, 'Jam yang digunakan:'),
        React.createElement('input', {
          type: 'number', value: hoursUsed, onChange: (e) => setHoursUsed(e.target.value),
          className: 'w-full bg-discord-darker p-2 rounded mb-4'
        }),
        React.createElement('div', { className: 'flex justify-end gap-4 mt-6' }, 
          React.createElement('button', { onClick: onClose, className: 'bg-gray-600 py-2 px-4 rounded' }, 'Batal'),
          React.createElement('button', { onClick: handleCompleteWithoutReview, disabled: isLoading, className: 'bg-red-600 py-2 px-4 rounded' }, isLoading ? 'Memproses...' : 'Selesaikan'),
          React.createElement('button', { onClick: handleCompleteAndCreateReview, disabled: isLoading, className: 'bg-discord-blurple py-2 px-4 rounded' }, isLoading ? 'Memproses...' : 'Selesaikan & Buat Link Ulasan')
        )
      )
    );
};

// --- Komponen Manajemen PC ---
const PCManagement = () => {
    const [pcSlots, setPcSlots] = useState([]);
    const [isInputModalOpen, setInputModalOpen] = useState(false);
    const [selectedPcId, setSelectedPcId] = useState(null);
    useEffect(() => { const q = query(collection(db, 'pcs')); const unsubscribe = onSnapshot(q, (snapshot) => setPcSlots(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))); return () => unsubscribe(); }, []);
    
    // --- LOGIKA NOTIFIKASI CERDAS BARU ---
    const sendAvailabilityNotification = async (pcId) => {
        try {
            // Panggil API Route untuk mengirim notifikasi
            const response = await fetch('/api/sendSmartNotification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pcId: pcId }),
            });
            const data = await response.json();
            if (response.ok) {
                alert(`Notifikasi PC ${pcId} berhasil dikirim ke ${data.recipientCount} pengguna.`);
            } else {
                alert(`Gagal mengirim notifikasi: ${data.message}`);
            }
        } catch (error) {
            console.error("Gagal memanggil API notifikasi:", error);
            alert("Terjadi kesalahan pada sistem notifikasi.");
        }
    };
    
    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateDoc(doc(db, 'pcs', id), { status: newStatus });
            if (newStatus === 'READY') {
                sendAvailabilityNotification(id);
            }
            if (newStatus === 'DIGUNAKAN') {
                setSelectedPcId(id);
                setInputModalOpen(true);
            }
        } catch (error) {
            console.error("Gagal memperbarui status PC:", error);
            alert("Terjadi kesalahan.");
        }
    };

    const handleUserInputSubmit = async (userName, durationHours) => {
        if (userName && durationHours > 0 && selectedPcId) {
            await updateDoc(doc(db, 'pcs', selectedPcId), { status: 'DIGUNAKAN', currentUser: userName, startTime: serverTimestamp(), durationHours: durationHours });
        }
        setInputModalOpen(false);
        setSelectedPcId(null);
    };

    return React.createElement('div', null,
        React.createElement(AnimatePresence, null, isInputModalOpen && React.createElement(SetPCUsedModal, { onClose: () => setInputModalOpen(false), onSubmit: handleUserInputSubmit })),
        React.createElement('h2', { className: 'text-2xl font-bold mb-4 flex items-center' }, React.createElement(Monitor, { size: 20, className: 'mr-2' }), 'Status Slot PC'),
        React.createElement('div', { className: 'bg-black/20 border border-discord-darker p-4 rounded-lg space-y-3' }, pcSlots.map(pc => React.createElement('div', { key: pc.id, className: 'bg-discord-darker p-3 rounded-lg flex justify-between items-center' }, React.createElement('div', null, React.createElement('p', { className: 'font-bold' }, pc.id), React.createElement('p', { className: `text-sm ${pc.status === 'READY' ? 'text-green-400' : pc.status === 'DIGUNAKAN' ? 'text-yellow-400' : 'text-gray-400'}` }, pc.status)), React.createElement('select', { value: pc.status, onChange: (e) => handleStatusChange(pc.id, e.target.value), className: 'bg-discord-dark text-white rounded p-1 text-sm' }, React.createElement('option', { value: 'READY' }, 'Ready'), React.createElement('option', { value: 'DIGUNAKAN' }, 'Digunakan'), React.createElement('option', { value: 'OFFLINE' }, 'Offline')))))
    );
};

// --- HALAMAN ADMIN UTAMA ---
export default function AdminPage() {
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('transactions');
    const [transactions, setTransactions] = useState([]);
    const [verifRequests, setVerifRequests] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [pcs, setPcs] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isAccountModalOpen, setAccountModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [isCompleteModalOpen, setCompleteModalOpen] = useState(false);
    const [completingTransaction, setCompletingTransaction] = useState(null);
    
    // Redirect jika bukan admin
    useEffect(() => {
        if (!loading && (!user || userData?.role !== 'admin')) {
            router.push('/');
        }
    }, [user, userData, loading, router]);

    // Ambil data dari Firestore
    useEffect(() => {
        if (userData?.role !== 'admin') return;

        // Transaksi
        const unsubTransactions = onSnapshot(query(collection(db, 'transactions'), where('status', '==', 'pending')), (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTransactions(data);
        });

        // Verifikasi
        const unsubVerifications = onSnapshot(query(collection(db, 'verifications')), (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setVerifRequests(data);
        });

        // Akun
        const unsubAccounts = onSnapshot(collection(db, 'accounts'), (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAccounts(data);
        });

        // PC
        const unsubPcs = onSnapshot(collection(db, 'pcs'), (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPcs(data);
        });

        return () => {
            unsubTransactions();
            unsubVerifications();
            unsubAccounts();
            unsubPcs();
        };
    }, [userData]);

    const handleOpenVerification = (request) => {
        setSelectedRequest(request);
    };

    const handleEditAccount = (account) => {
        setEditingAccount(account);
        setAccountModalOpen(true);
    };

    const handleDeleteAccount = async (accountId) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus akun ini?")) {
            try {
                await deleteDoc(doc(db, 'accounts', accountId));
                alert("Akun berhasil dihapus.");
            } catch (error) {
                console.error("Gagal menghapus akun:", error);
                alert("Terjadi kesalahan.");
            }
        }
    };

    const handleCompleteTransaction = (transaction) => {
      setCompletingTransaction(transaction);
      setCompleteModalOpen(true);
    };
    
    const handleUpdatePCStatus = async (pcId, status) => {
        try {
            await updateDoc(doc(db, 'pcs', pcId), { status });
            alert(`Status PC berhasil diubah menjadi ${status}`);
        } catch (error) {
            console.error("Gagal memperbarui status PC:", error);
            alert("Terjadi kesalahan.");
        }
    };

    if (loading || !user || userData?.role !== 'admin') {
        return React.createElement('div', { className: 'flex justify-center items-center h-screen' }, 'Memuat...');
    }
    
    const pendingVerifications = verifRequests.filter(req => req.status === 'pending');
    
    const renderTabContent = () => {
        switch (activeTab) {
            case 'transactions':
                return React.createElement(motion.div, { key: 'transactions', initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.3 } },
                    React.createElement('h2', { className: 'text-2xl font-bold mb-4' }, 'Transaksi Menunggu Konfirmasi'),
                    transactions.length > 0 ?
                        React.createElement('div', { className: 'space-y-4' },
                            transactions.map(tx => React.createElement('div', { key: tx.id, className: 'bg-black/20 p-4 rounded-lg flex justify-between items-center' },
                                React.createElement('div', null,
                                    React.createElement('p', null, `User: ${tx.userName}`),
                                    React.createElement('p', null, `PC: ${tx.pcName}`),
                                    React.createElement('p', null, `Paket: ${tx.paket}`),
                                    React.createElement('p', null, `Harga: Rp ${tx.harga.toLocaleString('id-ID')}`)
                                ),
                                React.createElement('button', { onClick: () => handleCompleteTransaction(tx), className: 'bg-discord-blurple py-2 px-4 rounded-full' }, 'Selesaikan')
                            ))
                        ) :
                        React.createElement('p', { className: 'text-discord-gray' }, 'Tidak ada transaksi yang menunggu.')
                );
            case 'pcs':
                return React.createElement(motion.div, { key: 'pcs', initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.3 } },
                    React.createElement('h2', { className: 'text-2xl font-bold mb-4' }, 'Manajemen PC'),
                    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
                        pcs.map(pc => React.createElement(PCCard, { key: pc.id, pc: pc, onUpdateStatus: handleUpdatePCStatus }))
                    )
                );
            case 'accounts':
                return React.createElement(motion.div, { key: 'accounts', initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.3 } },
                    React.createElement('div', { className: 'flex justify-between items-center mb-4' },
                        React.createElement('h2', { className: 'text-2xl font-bold' }, 'Manajemen Akun'),
                        React.createElement('button', { onClick: () => { setEditingAccount(null); setAccountModalOpen(true); }, className: 'bg-discord-blurple py-2 px-4 rounded-full' }, React.createElement(PlusCircle, { className: 'inline-block mr-2' }), 'Tambah Akun')
                    ),
                    accounts.length > 0 ?
                        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
                            accounts.map(acc => React.createElement('div', { key: acc.id, className: 'bg-black/20 p-4 rounded-lg flex justify-between items-center' },
                                React.createElement('div', null,
                                    React.createElement('h3', { className: 'text-lg font-semibold' }, acc.gameName),
                                    React.createElement('p', { className: 'text-discord-gray' }, `Rp ${acc.price.toLocaleString('id-ID')}`)
                                ),
                                React.createElement('div', { className: 'flex gap-2' },
                                    React.createElement('button', { onClick: () => handleEditAccount(acc), className: 'text-blue-400 hover:text-blue-500' }, React.createElement(Edit, null)),
                                    React.createElement('button', { onClick: () => handleDeleteAccount(acc.id), className: 'text-red-400 hover:text-red-500' }, React.createElement(Trash2, null))
                                )
                            ))
                        ) :
                        React.createElement('p', { className: 'text-discord-gray' }, 'Belum ada akun yang terdaftar.')
                );
            case 'verifications':
                return React.createElement(motion.div, { key: 'verifications', initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.3 } },
                    React.createElement('h2', { className: 'text-2xl font-bold mb-4' }, `Verifikasi User (${pendingVerifications.length})`),
                    pendingVerifications.length > 0 ?
                        React.createElement('div', { className: 'space-y-4' },
                            pendingVerifications.map(req => React.createElement('div', { key: req.id, className: 'bg-black/20 p-4 rounded-lg flex justify-between items-center' },
                                React.createElement('div', null,
                                    React.createElement('p', { className: 'font-semibold' }, req.userName),
                                    React.createElement('p', { className: 'text-discord-gray text-sm' }, req.userEmail)
                                ),
                                React.createElement('button', { onClick: () => handleOpenVerification(req), className: 'bg-discord-blurple py-2 px-4 rounded-full' }, 'Tinjau')
                            ))
                        ) :
                        React.createElement('p', { className: 'text-discord-gray' }, 'Tidak ada permintaan verifikasi.')
                );
            default:
                return null;
        }
    };

    return React.createElement('div', { className: 'container mx-auto px-4 py-8' },
      React.createElement(Head, null, React.createElement('title', null, 'Panel Admin - XyCloud')),
      React.createElement('div', { className: 'text-center mb-8' },
        React.createElement(Shield, { className: 'mx-auto h-12 w-12 text-yellow-400 mb-4' }),
        React.createElement('h1', { className: 'text-4xl font-extrabold' }, 'Panel Admin')
      ),
      React.createElement('div', { className: 'bg-black/20 border border-discord-darker p-8 rounded-lg shadow-lg' },
        React.createElement('div', { className: 'flex space-x-4 border-b border-discord-darker mb-6' },
          React.createElement('button', { onClick: () => setActiveTab('transactions'), className: `py-2 px-4 font-semibold ${activeTab === 'transactions' ? 'text-white border-b-2 border-discord-blurple' : 'text-discord-gray'}` }, 'Manajemen Transaksi'),
          React.createElement('button', { onClick: () => setActiveTab('pcs'), className: `py-2 px-4 font-semibold ${activeTab === 'pcs' ? 'text-white border-b-2 border-discord-blurple' : 'text-discord-gray'}` }, 'Manajemen PC'),
          React.createElement('button', { onClick: () => setActiveTab('accounts'), className: `py-2 px-4 font-semibold ${activeTab === 'accounts' ? 'text-white border-b-2 border-discord-blurple' : 'text-discord-gray'}` }, 'Manajemen Akun'),
          React.createElement('button', { onClick: () => setActiveTab('verifications'), className: `py-2 px-4 font-semibold ${activeTab === 'verifications' ? 'text-white border-b-2 border-discord-blurple' : 'text-discord-gray'}` }, `Verifikasi User (${pendingVerifications.length})`)
        ),
        React.createElement(AnimatePresence, { mode: 'wait' },
            renderTabContent()
        ),
        React.createElement(AnimatePresence, null, 
            selectedRequest && React.createElement(VerificationModal, { request: selectedRequest, onClose: () => setSelectedRequest(null) }),
            isAccountModalOpen && React.createElement(AccountFormModal, { account: editingAccount, onClose: () => setAccountModalOpen(false) }),
            isCompleteModalOpen && React.createElement(CompleteTransactionModal, { transaction: completingTransaction, onClose: () => setCompleteModalOpen(false) })
        )
      )
    );
}