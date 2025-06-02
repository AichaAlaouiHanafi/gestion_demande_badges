import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';


const ProposerRdvPage = () => {
  const { demandeId } = useParams();
  const [date, setDate] = useState('');
  const [heure, setHeure] = useState('');
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const navigate = useNavigate();
  console.log(token, role);
  console.log('ProposerRdvPage - token:', token, 'role:', role);
  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:8081/api/rdvs/proposer', {
        
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        demandeId: Number(demandeId),
        dateProposee: `${date}T${heure}`
      })
      
    });
    alert('Rendez-vous proposé à l\'employé !');
    navigate('/superadmin/demandes'); // Redirige vers la liste des demandes ou autre page
  };

  return (
    <form onSubmit={handleSubmit} style={{maxWidth:400,margin:'40px auto',background:'#fff',padding:24,borderRadius:8}}>
      <h2>Proposer un rendez-vous</h2>
      <label>Date :<br />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={{width:'100%'}} />
      </label><br /><br />
      <label>Heure :<br />
        <input type="time" value={heure} onChange={e => setHeure(e.target.value)} required style={{width:'100%'}} />
      </label><br /><br />
      <button type="submit" style={{background:'#4CAF50',color:'white',border:'none',borderRadius:4,padding:'10px 20px'}}>Proposer le rendez-vous</button>
    </form>
  );
};

export default ProposerRdvPage;
