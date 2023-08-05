import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

const Entry: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    console.log(id);
  }, [id]);

  return <div>Entry {id}</div>;
};

export default Entry;
