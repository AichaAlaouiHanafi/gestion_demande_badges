import React, { useEffect, useState } from 'react';

const DepartementEmployesPage = () => {
  const [departements, setDepartements] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [employes, setEmployes] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8081/api/departments')
      .then(res => res.json())
      .then(data => setDepartements(data));
  }, []);

  const handleDeptClick = (deptId) => {
    setSelectedDept(deptId);
    fetch(`http://localhost:8081/api/utilisateurs/par-departement/${deptId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Erreur API: ' + res.status);
        return res.json();
      })
      .then(data => setEmployes(Array.isArray(data) ? data : []))
      .catch(err => {
        setEmployes([]);
        alert('Erreur lors du chargement des employés : ' + err.message);
      });
  };
  return (
    <div>
      <h2>Liste des départements</h2>
      <ul>
        {departements.map(dept => (
          <li key={dept.departement_id}>
            <button onClick={() => handleDeptClick(dept.departement_id)}>
              {dept.nomDepartement}
            </button>
          </li>
        ))}
      </ul>

      {selectedDept && (
        <div>
          <h3>Employés du département</h3>
          {Array.isArray(employes) && employes.length > 0 ? (
            <ul>
              {employes.map(emp => (
                <li key={emp.id}>{emp.nom} {emp.prenom}</li>
              ))}
            </ul>
          ) : (
            <p>Aucun employé trouvé pour ce département.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DepartementEmployesPage;