import React,{useState} from 'react';
import styles from "./Auth.module.css";
import { useDispatch } from 'react-redux';
import { auth, provider, storage } from '../firebase';
import { updateUserProfile } from '../features/userSlice';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '@firebase/auth';
import { ref, uploadBytes, getDownloadURL } from '@firebase/storage';
import { updateProfile, sendPasswordResetEmail } from '@firebase/auth';
import{
  Avatar,
  CssBaseline,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Link,
  Paper,
  Box,
  Grid,
  IconButton,
  Modal
} from "@mui/material";
import SendIcon from "@material-ui/icons/Send";
import CameraIcon from "@material-ui/icons/Camera";
import EmailIcon from "@material-ui/icons/Email";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {makeStyles} from "@material-ui/core";

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}
const useStyles = makeStyles((theme)=>({
  modal: {
    outline: "none",
    position: "absolute",
    width: 400,
    borderRadius: 10,
    backgroundColor: "white",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(10),
  },
}))



const theme = createTheme();

export const Auth: React.FC= () => {
  const classes = useStyles();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [avatarImage, setAvatarImage] = useState<File | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const dispatch = useDispatch();

  const sendResetEmail = async(e: React.MouseEvent<HTMLElement>) => {
    await sendPasswordResetEmail(auth, resetEmail)
      .then(()=>{
        setOpenModal(false);
        setResetEmail("");
      }).catch((err)=>{
        alert(err.message);
        setResetEmail("");
      });
  };

  const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files![0]){
      setAvatarImage(e.target.files![0]);
      e.target.value = "";
    }
  };

  const signInEmail = async () => {
    await signInWithEmailAndPassword(auth, email, password);
  };
  const signUpEmail = async () => {
    const authUser = await createUserWithEmailAndPassword(auth, email, password);
    let url = "";
    if (avatarImage){
      const S =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const N = 16;
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length])
        .join("");
      const fileName = randomChar + "_" + avatarImage.name;

      await uploadBytes(ref(storage, `avatars/${fileName}`), avatarImage);
      url = await getDownloadURL(ref(storage, `avatars/${fileName}`));
    }

    if(authUser.user){
      await updateProfile(authUser.user,{
        displayName: username,
        photoURL: url,
      });
    }
    dispatch(updateUserProfile({
      displayName: username,
      photoUrl: url
    }));
  };
  const signInGoogle = async() => {
    await signInWithPopup(auth, provider).catch((err)=>alert(err.message));
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    // eslint-disable-next-line no-console
    console.log({
      email: data.get('email'),
      password: data.get('password'),
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1548247416-ec66f4900b2e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=663&q=80)',
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              {isLogin ? "Login" : "Register"}
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
              {!isLogin && (
                <>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="username"
                    label="Username"
                    name="username"
                    autoComplete="username"
                    autoFocus
                    value={username}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setUsername(e.target.value)}
                  />
                  <Box textAlign="center">
                    <IconButton>
                      <label>
                        <AccountCircleIcon
                          fontSize="large"
                          className={
                            avatarImage
                              ? styles.login_addIconLoaded
                              : styles.login_addIcon
                          }
                        />
                        <input
                          className={styles.login_hiddenIcon}
                          type="file"
                          onChange={onChangeImageHandler}
                        />
                      </label>
                    </IconButton>
                  </Box>
                </>
              )}
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setEmail(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setPassword(e.target.value)}
              />
        
              <Button
                disabled={
                  isLogin 
                    ? !email || password.length<6
                    : !username || !email || password.length<6 || !avatarImage
                }
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                startIcon={<EmailIcon />}
                onClick={
                  isLogin
                    ? async () => {
                      try{
                        await signInEmail();
                      }catch(err: any){
                        alert(err.message)
                      }
                    }
                    : async () => {
                      try{
                        await signUpEmail();
                      }catch(err: any){
                        alert(err.message);
                      }
                    }
                }
              >
                {isLogin ? "Login" : "Register"}
              </Button>
              <Grid container>
                <Grid item xs>
                  <span 
                    className={styles.login_reset}
                    onClick={()=>setOpenModal(true)}
                  >
                    Forgot password?
                  </span>
                </Grid>
                <Grid item >
                  <span 
                    onClick={()=>setIsLogin(!isLogin)}
                    className={styles.login_toggleMode}
                  >
                    {isLogin ? "Create new account ?" : "Back to login"}
                  </span>
                </Grid>
              </Grid>

              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={signInGoogle}
                startIcon={<CameraIcon/>}
              >
                SignIn with Google
              </Button>
            </Box>
          </Box>
          <Modal open={openModal} onClose={()=>setOpenModal(false)}>
            <div style={getModalStyle()} className={classes.modal}>
              <div className={styles.login_modal}>
                <TextField
                  InputLabelProps={{
                    shrink: true,
                  }}
                  type="email"
                  name="email"
                  label="Reset E-mail"
                  value={resetEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setResetEmail(e.target.value);
                  }}
                />
                <IconButton onClick={sendResetEmail}>
                  <SendIcon />
                </IconButton>
              </div>
            </div>
          </Modal>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}