import React from 'react'
import { auth } from '../firebase'
import { signOut } from '@firebase/auth'
export const Feed = () => {
  return (
    <div>
      Feed
      <button onClick={()=>signOut(auth)}>Logout</button>
    </div>
  )
}
