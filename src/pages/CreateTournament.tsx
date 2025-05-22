
import React from 'react';
import Layout from '@/components/Layout';
import CreateTournamentForm from '@/components/CreateTournamentForm';

const CreateTournament = () => {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Создать новый турнир</h1>
        <CreateTournamentForm />
      </div>
    </Layout>
  );
};

export default CreateTournament;
