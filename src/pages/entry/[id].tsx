import { useRouter } from 'next/router';
import React from 'react';

const Entry: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  return <div>Entry {id}</div>;
};

export default Entry;
