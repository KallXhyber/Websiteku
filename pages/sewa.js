// pages/sewa.js
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, ShieldCheck, MessageSquare, ExternalLink, Plus, Minus, Wallet, Bell, Loader2 } from 'lucide-react';
import Alert from '../components/Alert';
import { db, auth } from '../utils/firebase';
import { setDoc, doc, serverTimestamp, collection, addDoc, updateDoc, increment, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';

// --- DATA ADMIN DENGAN STRUKTUR HARGA PAKET ---
const adminData = [
  { 
    id: 'kall', name: 'Kall', wa: '6283116632566', jamMulai: 18, jamSelesai: 6,
    pricing: [
        { id: 'jam', name: '1 Jam', price: 4000, type: 'hourly' },
        { id: '12jam', name: '12 Jam', price: 25000, type: 'fixed' },
        { id: 'siang', name: 'Paket Siang', price: 20000, type: 'fixed' },
        { id: 'malam', name: 'Paket Malam', price: 25000, type: 'fixed' }
    ]
  },
  { 
    id: 'dwingi', name: 'Dwingi', wa: '6282256775090', jamMulai: 6, jamSelesai: 18,
    pricing: [
        { id: 'jam', name: '1 Jam', price: 4000, type: 'hourly' },
        { id: '12jam', name: '12 Jam', price: 30000, type: 'fixed' },
        { id: 'siang', name: 'Paket Siang', price: 20000, type: 'fixed' },
        { id: 'malam', name: 'Paket Malam', price: 25000, type: 'fixed' }
    ]
  },
  { 
    id: 'dlii', name: 'Dlii', wa: '6283150220978', jamMulai: 14, jamSelesai: 0,
    pricing: [
        { id: 'jam', name: '1 Jam', price: 5000, type: 'hourly' },
        { id: '12jam', name: '12 Jam', price: 30000, type: 'fixed' },
        { id: 'siang', name: 'Paket Siang', price: 20000, type: 'fixed' },
        { id: 'malam', name: 'Paket Malam', price: 25000, type: 'fixed' }
    ]
  }
];

// --- KOMPONEN POP-UP VERIFIKASI ---
const VerificationPopup = ({ onClose }) => {
    const [files, setFiles] = useState({ discord: null, steam: null, cfx: null });
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', message: '' });
    const { user } = useAuth();
    const handleFileChange = (e, type) => setFiles({ ...files, [type]: e.target.files[0] });
    const handleVerificationSubmit = async (e) => {
        e.preventDefault();
        if (!user || !files.discord || !files.steam || !files.cfx) { setFeedback({ type: 'error', message: !user ? 'Anda harus login.' : 'Harap upload ketiga screenshot.' }); return; }
        setIsLoading(true); setFeedback({ type: '', message: '' });
        try {
            const uploadPromises = Object.entries(files).map(async ([type, file]) => {
                const filePath = `${user.uid}/${type}-${Date.now()}`;
                const { data, error } = await supabase.storage.from('verification-screenshots').upload(filePath, file);
                if (error) throw error;
                const { data: { publicUrl } } = supabase.storage.from('verification-screenshots').getPublicUrl(data.path);
                return { type, url: publicUrl };
            });
            const uploadedFiles = await Promise.all(uploadPromises);
            const fileUrls = uploadedFiles.reduce((acc, file) => ({ ...acc, [file.type]: file.url }), {});
            await setDoc(doc(db, 'verification_requests', user.uid), { userId: user.uid, userEmail: user.email, discordUrl: fileUrls.discord, steamUrl: fileUrls.steam, cfxUrl: fileUrls.cfx, message: message, status: 'pending', submittedAt: serverTimestamp() });
            await setDoc(doc(db, 'users', user.uid), { verificationStatus: 'pending' }, { merge: true });
            setFeedback({ type: 'success', message: 'Verifikasi berhasil dikirim!' });
            setTimeout(onClose, 3000);
        } catch (error) { console.error("Error verifikasi:", error); setFeedback({ type: 'error', message: 'Gagal mengupload file.' }); } 
        finally { setIsLoading(false); }
    };
    const FileInput = ({ label, type, file }) => React.createElement('div', null,
        React.createElement('label', { className: 'block text-sm font-medium text-discord-gray mb-1' }, label),
        React.createElement('div', { className: 'flex items-center bg-discord-darker rounded-lg' },
            React.createElement('label', { htmlFor: `${type}-upload`, className: 'flex-grow p-2 cursor-pointer truncate text-sm' }, file ? file.name : 'Pilih file...'),
            React.createElement('input', { id: `${type}-upload`, type: 'file', accept: 'image/*', onChange: (e) => handleFileChange(e, type), className: 'hidden' })
        )
    );
    return React.createElement(motion.div, { className: 'fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4' },
        React.createElement(motion.div, { className: 'bg-discord-dark rounded-lg p-8 w-full max-w-lg relative' },
            React.createElement('button', { onClick: onClose, className: 'absolute top-4 right-4 text-gray-400' }, 'X'),
            React.createElement('div', { className: 'text-center' }, React.createElement(ShieldCheck, { className: 'mx-auto h-12 w-12 text-discord-blurple mb-4' }), React.createElement('h2', { className: 'text-2xl font-bold' }, 'Verifikasi Diri')),
            React.createElement('form', { onSubmit: handleVerificationSubmit, className: 'space-y-4 mt-6' },
                React.createElement(FileInput, { label: 'SS Akun Discord', type: 'discord', file: files.discord }),
                React.createElement(FileInput, { label: 'SS Akun Steam', type: 'steam', file: files.steam }),
                React.createElement(FileInput, { label: 'SS Akun Cfx.re', type: 'cfx', file: files.cfx }),
                React.createElement('textarea', { value: message, onChange: (e) => setMessage(e.target.value), placeholder: 'Pesan tambahan...', rows: 2, className: 'w-full bg-discord-darker text-white p-2 rounded-lg' }),
                feedback.message && React.createElement(Alert, { type: feedback.type, message: feedback.message }),
                React.createElement('button', { type: 'submit', disabled: isLoading, className: 'w-full bg-discord-blurple text-white font-bold py-3 rounded-full' }, isLoading ? 'Mengirim...' : 'Kirim Verifikasi')
            )
        )
    );
};

// --- KOMPONEN POP-UP TRANSAKSI ---
const TransactionPopup = ({ admin, user, paket, totalHarga, jumlahJam, onClose }) => {
    const [billingId, setBillingId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { userData } = useAuth();
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (billingId.length < 4) { setError('Harap isi minimal 4 digit terakhir nomor WA Anda.'); return; }
        setIsLoading(true); setError('');
        try {
            const paketPesan = paket.type === 'hourly' ? `${jumlahJam} Jam` : paket.name;
            await addDoc(collection(db, "transactions"), { userId: user.uid, userEmail: user.email, adminId: admin.id, adminName: admin.name, paket: paketPesan, harga: totalHarga, billingId: billingId, createdAt: serverTimestamp(), status: "menunggu konfirmasi" });
            const userName = userData.displayName || user.email.split('@')[0];
            const text = `Halo! ${admin.name}, saya mau konfirmasi sewa.\n\n*Nama:* ${userName}\n*Paket:* ${paketPesan}\n*Harga:* Rp ${totalHarga.toLocaleString('id-ID')}\n*Billing:* ${billingId}`;
            const encodedText = encodeURIComponent(text);
            const waLink = `https://wa.me/${admin.wa}?text=${encodedText}`;
            window.open(waLink, '_blank');
            onClose();
        } catch (err) { console.error("Gagal membuat transaksi:", err); setError('Terjadi kesalahan.'); setIsLoading(false); }
    };
    return React.createElement(motion.div, { className: 'fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4' },
        React.createElement(motion.div, { className: 'bg-discord-dark rounded-lg p-8 w-full max-w-md relative' },
            React.createElement('button', { onClick: onClose, className: 'absolute top-4 right-4 text-gray-400' }, 'X'),
            React.createElement('div', { className: 'text-center' }, React.createElement(MessageSquare, { className: 'mx-auto h-12 w-12 text-discord-blurple mb-4' }), React.createElement('h2', { className: 'text-2xl font-bold' }, 'Konfirmasi Sewa'), React.createElement('p', { className: 'text-discord-gray mt-2' }, `Anda akan menyewa dari admin ${admin.name}.`)),
            React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4 mt-6' },
                React.createElement('div', {},
                    React.createElement('label', { htmlFor: 'billingId', className: 'block text-sm font-medium text-discord-gray mb-1' }, '4 Digit Terakhir No. WA (Billing)'),
                    React.createElement('input', { id: 'billingId', type: 'number', value: billingId, onChange: (e) => setBillingId(e.target.value.slice(0, 4)), placeholder: 'Contoh: 2566', required: true, className: 'w-full bg-discord-darker text-white p-3 rounded-lg' })
                ),
                error && React.createElement('p', { className: 'text-red-500 text-sm text-center' }, error),
                React.createElement('button', { type: 'submit', disabled: isLoading, className: 'w-full bg-green-600 text-white font-bold py-3 rounded-full flex items-center justify-center' }, isLoading ? 'Memproses...' : 'Lanjut ke WhatsApp', !isLoading && React.createElement(ExternalLink, {size: 18, className: 'ml-2'}))
            )
        )
    );
};

// --- KOMPONEN UTAMA HALAMAN SEWA PC ---
export default function SewaPage() {
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [hours, setHours] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [showTransactionPopup, setShowTransactionPopup] = useState(false);
  const { user, userData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const now = new Date();
    const currentHour = (now.getUTCHours() + 8) % 24;
    const updatedAdmins = adminData.map(admin => {
        const { jamMulai, jamSelesai } = admin;
        let isOnline = false;
        if (jamMulai > jamSelesai) { isOnline = currentHour >= jamMulai || currentHour < jamSelesai; } 
        else { isOnline = currentHour >= jamMulai && currentHour < jamSelesai; }
        return { ...admin, isOnline };
    });
    setAdmins(updatedAdmins);
  }, []);

  useEffect(() => {
    if (!selectedPackage) { setTotalPrice(0); return; }
    if (selectedPackage.type === 'hourly') { setTotalPrice(selectedPackage.price * hours); } 
    else { setTotalPrice(selectedPackage.price); }
  }, [selectedPackage, hours]);

  const handleAdminSelect = (admin) => { if (admin.isOnline) { setSelectedAdmin(admin); setSelectedPackage(null); setHours(1); } };
  const handlePackageSelect = (pkg) => { setSelectedPackage(pkg); if (pkg.type !== 'hourly') { setHours(1); } };
  
  const handleSewa = () => {
    if (!user) { alert('Anda harus login terlebih dahulu.'); router.push('/login'); return; }
    if (userData?.verificationStatus === 'terverifikasi') { setShowTransactionPopup(true); } 
    else if (userData?.verificationStatus === 'pending') { alert('Verifikasi Anda sedang ditinjau oleh Admin. Mohon tunggu.'); } 
    else { setShowVerificationPopup(true); }
  };

  const handleUseSaldo = async () => {
    if (!user || !userData || !(userData.saldoWaktu > 0)) { alert("Anda tidak memiliki saldo waktu."); return; }
    const jamDigunakan = prompt(`Anda punya sisa waktu ${Math.floor(userData.saldoWaktu / 60)} jam ${userData.saldoWaktu % 60} menit. Berapa jam yang ingin Anda gunakan?`, "1");
    const hoursToUse = parseInt(jamDigunakan, 10);
    if (isNaN(hoursToUse) || hoursToUse <= 0) { alert("Input tidak valid."); return; }
    const minutesToUse = hoursToUse * 60;
    if (minutesToUse > userData.saldoWaktu) { alert("Saldo waktu Anda tidak mencukupi."); return; }
    try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { saldoWaktu: increment(-minutesToUse) });
        const pcIdToUse = prompt("PENTING: Masukkan ID PC yang akan digunakan (misal: PC-1A):");
        if (pcIdToUse) {
            const pcDocRef = doc(db, 'pc_slots', pcIdToUse);
            await updateDoc(pcDocRef, { status: 'DIGUNAKAN', currentUser: userData.displayName || user.email.split('@')[0], startTime: serverTimestamp(), durationHours: hoursToUse });
        }
        alert(`Berhasil menggunakan ${hoursToUse} jam dari saldo. PC ${pcIdToUse || ''} sekarang aktif.`);
        router.reload();
    } catch (error) { console.error("Gagal menggunakan saldo:", error); alert("Terjadi kesalahan."); }
  };

  return React.createElement('div', { className: 'container mx-auto px-4 py-8' },
    React.createElement(Head, null, React.createElement('title', null, 'Sewa PC - XyCloud')),
    showVerificationPopup && React.createElement(VerificationPopup, { onClose: () => setShowVerificationPopup(false) }),
    showTransactionPopup && selectedAdmin && user && React.createElement(TransactionPopup, { admin: selectedAdmin, user: user, paket: selectedPackage, totalHarga: totalPrice, jumlahJam: hours, onClose: () => setShowTransactionPopup(false) }),
    userData?.saldoWaktu > 0 && React.createElement(motion.div, {
        className: 'bg-green-500/20 border border-green-400 text-green-300 p-4 rounded-lg mb-8 flex justify-between items-center',
        initial: { opacity: 0 }, animate: { opacity: 1 }
    },
        React.createElement('div', { className: 'flex items-center' }, React.createElement(Wallet, { className: 'mr-3' }),
            React.createElement('div', null, React.createElement('h3', { className: 'font-bold' }, 'Anda Punya Saldo Waktu!'), React.createElement('p', { className: 'text-sm' }, `${Math.floor(userData.saldoWaktu / 60)} jam ${userData.saldoWaktu % 60} menit`))
        ),
        React.createElement('button', { onClick: handleUseSaldo, className: 'bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg' }, 'Gunakan Saldo')
    ),
    React.createElement(motion.div, {
        className: 'bg-black/20 border border-discord-darker p-8 rounded-lg shadow-xl',
        initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }
    },
      React.createElement('div', { className: 'text-center mb-10' }, React.createElement(Server, { className: 'mx-auto h-12 w-12 text-discord-blurple mb-4' }), React.createElement('h1', { className: 'text-4xl font-extrabold' }, 'Sewa Cloud PC'), React.createElement('p', { className: 'text-discord-gray mt-2' }, 'Satu spesifikasi untuk semua kebutuhan gaming Anda.')),
      React.createElement('div', { className: 'mb-8' },
        React.createElement('h2', { className: 'text-2xl font-bold mb-4 text-center' }, '1. Pilih Admin yang Bertugas'),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4' },
          admins.map(admin => React.createElement('button', { key: admin.id, onClick: () => handleAdminSelect(admin), className: `p-4 rounded-lg border-2 text-left transition-all ${selectedAdmin?.id === admin.id ? 'border-discord-blurple bg-discord-blurple/20' : 'border-discord-darker'} ${admin.isOnline ? 'cursor-pointer hover:border-discord-blurple' : 'opacity-50 cursor-not-allowed'}`},
              React.createElement('div', { className: 'flex justify-between items-center mb-2' }, React.createElement('h3', { className: 'text-lg font-bold' }, admin.name), React.createElement('div', { className: `px-2 py-1 text-xs rounded-full ${admin.isOnline ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'}` }, admin.isOnline ? 'Online' : 'Offline')),
              React.createElement('p', { className: 'text-sm text-discord-gray' }, `Jam: ${String(admin.jamMulai).padStart(2,'0')}:00 - ${String(admin.jamSelesai).padStart(2,'0')}:00`)
            ))
        )
      ),
      selectedAdmin && React.createElement(motion.div, {
        className: 'mb-8', initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }
      },
        React.createElement('h2', { className: 'text-2xl font-bold mb-4 text-center' }, '2. Pilih Paket Sewa'),
        React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-4' },
            selectedAdmin.pricing.map(pkg => React.createElement('button', { key: pkg.id, onClick: () => handlePackageSelect(pkg), className: `p-3 rounded-lg border-2 text-center transition-all ${selectedPackage?.id === pkg.id ? 'border-discord-blurple bg-discord-blurple/20' : 'border-discord-darker hover:border-discord-blurple'}`},
                React.createElement('p', { className: 'font-bold' }, pkg.name),
                React.createElement('p', { className: 'text-sm text-discord-gray' }, `Rp ${pkg.price.toLocaleString('id-ID')}`)
            ))
        ),
        selectedPackage?.type === 'hourly' && React.createElement(motion.div, {
            className: 'mt-4 flex flex-col items-center', initial: { opacity: 0 }, animate: { opacity: 1 }
        },
            React.createElement('p', { className: 'text-discord-gray mb-2' }, 'Tentukan jumlah jam:'),
            React.createElement('div', { className: 'flex items-center gap-4 bg-discord-darker p-2 rounded-lg' },
                React.createElement('button', { onClick: () => setHours(h => Math.max(1, h - 1)), className: 'bg-discord-dark p-2 rounded' }, React.createElement(Minus, null)),
                React.createElement('span', { className: 'text-2xl font-bold w-12 text-center' }, hours),
                React.createElement('button', { onClick: () => setHours(h => h + 1), className: 'bg-discord-dark p-2 rounded' }, React.createElement(Plus, null))
            )
        )
      ),
      React.createElement('div', { className: 'text-center' },
        React.createElement('h2', { className: 'text-2xl font-bold mb-4 text-center' }, '3. Lakukan Penyewaan'),
        React.createElement('div', { className: 'bg-discord-darker p-6 rounded-lg mb-6 h-24 flex items-center justify-center' },
          totalPrice > 0 ?
            React.createElement('p', { className: 'text-3xl font-bold text-green-400' }, `Total: Rp ${totalPrice.toLocaleString('id-ID')}`) :
            React.createElement('p', { className: 'text-lg text-discord-gray' }, 'Pilih admin & paket untuk melihat harga.')
        ),
        React.createElement(motion.button, {
          onClick: handleSewa,
          disabled: !selectedAdmin || !selectedPackage,
          className: 'w-full max-w-md bg-discord-blurple text-white font-bold py-4 px-8 rounded-full disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed',
          whileHover: { scale: (selectedAdmin && selectedPackage) ? 1.05 : 1 },
          whileTap: { scale: (selectedAdmin && selectedPackage) ? 0.95 : 1 }
        }, 'Sewa Sekarang')
      )
    )
  );
}