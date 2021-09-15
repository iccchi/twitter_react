import React from 'react'
import styles from "./Feed.module.css"
import { auth, db } from '../firebase'
import { signOut } from '@firebase/auth'
import {TweetInput} from "./TweetInput"
import { useEffect, useState } from "react"
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { Post } from './Post'

export const Feed: React.FC = () => {
  const [posts, setPosts] = useState([
    {
      id: "",
      avatar: "",
      image: "",
      text: "",
      timestamp: null,
      username: "",
    }
  ]);

  useEffect(()=>{
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    const unSub = onSnapshot(q, (snapshot)=>{
      setPosts(
        snapshot.docs.map((doc)=>({
          id: doc.id,
          avatar: doc.data().avatar,
          image: doc.data().image,
          text: doc.data().text,
          timestamp: doc.data().timestamp,
          username: doc.data().username,
        }))
      )
    })
    return ()=>unSub();
  }, []);

  return (
    <div className={styles.feed}>
      <TweetInput />
      {posts[0]?.id && (
        <>
          {posts.map((post)=>(
            <Post 
              key={post.id} 
              postId={post.id} 
              avatar={post.avatar} 
              image={post.image} 
              text={post.text}
              timestamp={post.timestamp}
              username={post.username}
            />
          )
          )}
        </>
      )}
    </div>
  )
}
