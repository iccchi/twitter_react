import React, {useState} from 'react'
import styles from "./TweetInput.module.css"
import { useSelector } from 'react-redux'
import { selectUser } from '../features/userSlice'
import { signOut } from '@firebase/auth'
import { storage, db, auth } from '../firebase'
import { Avatar, Button, IconButton } from '@mui/material'
import AddAPhotoIcon from "@material-ui/icons/AddAPhoto"
import { collection, addDoc, serverTimestamp } from '@firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from '@firebase/storage'

export const TweetInput: React.FC = () => {
  const user = useSelector(selectUser);
  const [tweetImage, setTweetImage] = useState<File | null>(null);
  const [tweetMsg, setTweetMsg] = useState("");

  const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files![0]){
      setTweetImage(e.target.files![0]);
      e.target.value = "";
    }
  };
  const sendTweet = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(tweetImage){
      const S =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const N = 16;
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length])
        .join("");
      const fileName = randomChar + "_" + tweetImage.name;
      const uploadTweetImg = uploadBytesResumable(
        ref(storage, `images/${fileName}`),
        tweetImage
      );
      uploadTweetImg.on(
        "state_changed",
        ()=>{},
        (err)=>{
          alert(err.message)
        },
        async()=>{
          await getDownloadURL(ref(storage, `images/${fileName}`)).then(
            async (url) => {
              addDoc(collection(db, "posts"), {
                avatar: user.photoUrl,
                image: url,
                text: tweetMsg,
                timestamp: serverTimestamp(),
                username: user.displayName,
              });
            }
          );
        }
      );
    }else{
      addDoc(collection(db, "posts"), {
        avatar: user.photoUrl,
        image: "",
        text: tweetMsg,
        timestamp: serverTimestamp(),
        username: user.displayName,
      });
    }
    setTweetImage(null);
    setTweetMsg("");
  };

  return (
    <>
      <form onSubmit={sendTweet}>
        <div className={styles.tweet_form}>
          <Avatar
            className={styles.tweet_avatar}
            src={user.photoUrl}
            onClick={async() =>{
              await signOut(auth)
            }}
          />
          <input
            className={styles.tweet_input}
            placeholder="What's happening"
            type="text"
            autoFocus
            value={tweetMsg}
            onChange={(e)=>setTweetMsg(e.target.value)}
          />
          <IconButton>
            <label>
              <AddAPhotoIcon
                className={
                  tweetImage ? styles.tweet_addIconLoaded : styles.tweet_addIcon
                }
              />
              <input
                className={styles.tweet_hiddenIcon}
                type="file"
                onChange={onChangeImageHandler}
              />
            </label>
          </IconButton>
        </div>
        <Button
          type="submit"
          disabled={!tweetMsg}
          className={
            tweetMsg ? styles.tweet_sendBtn : styles.tweet_sendDisableBtn
          }
        >
          Tweet
        </Button>
      </form>
    </>
  )
}
