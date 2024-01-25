import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGoogle, FaFacebookF, FaSpinner } from 'react-icons/fa';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  sendEmailVerification
} from "firebase/auth";
import { auth, db } from '../../firebase';
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import image from './signup.png';

const SignUp = () => {
  const navigate = useNavigate();
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    general: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUserDetails(prevDetails => ({
      ...prevDetails,
      [name]: value
    }));
  };

  const handleImageChange = (event) => {
    if (event.target.files[0]) {
      setProfileImage(event.target.files[0]);
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setProfileImageUrl(fileReader.result);
      };
      fileReader.readAsDataURL(event.target.files[0]);
    }
  };

  const validateFields = () => {
    let errors = {};
    let isValid = true;

    if (!userDetails.email.includes('@')) {
      errors.email = 'Please enter a valid email address.';
      isValid = false;
    }

    if (!validatePassword(userDetails.password)) {
      errors.password = 'Your password needs at least 8 characters, including an uppercase letter, a number, and a special character.';
      isValid = false;
    }

    if (userDetails.password !== userDetails.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match. Please double-check them.';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const validatePassword = (password) => {
    const regExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regExp.test(password);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!validateFields()) {
      setError('Please correct the highlighted errors before submitting.');
      setLoading(false);
      return;
    }

    try {
      const { name, email, password } = userDetails;

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await sendEmailVerification(user);

      let imageUrl = 'default-profile-image-url';
      if (profileImage) {
        const storage = getStorage();
        const imageRef = storageRef(storage, `profileImages/${user.uid}`);
        const snapshot = await uploadBytes(imageRef, profileImage);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const userData = {
        Email: user.email,
        Username: name,
        ['Profile Image']: imageUrl,
        Timestamp: serverTimestamp()
      };

      await setDoc(doc(db, "Users", user.uid), userData);

      // Sign out the user after account creation and email verification sent
      await auth.signOut();

      setMessage("Signup successful! A verification email has been sent. Please check your email to verify your account before logging in.");
    } catch (err) {
      console.error("Error in signup process:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (result.additionalUserInfo?.isNewUser) {
        const userData = {
          Email: user.email,
          Username: user.displayName,
          ['Profile Image']: user.photoURL,
          Timestamp: serverTimestamp()
        };
        await setDoc(doc(db, "Users", user.uid), userData);
      }

      if (!user.emailVerified) {
        setMessage("Please verify your email before continuing.");
        return;
      }

      navigate('/homepage');
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError("Google sign-in failed: " + err.message);
    }
  };

  const signInWithFacebook = async () => {
    const provider = new FacebookAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (result.additionalUserInfo?.isNewUser) {
        const userData = {
          Email: user.email,
          Username: user.displayName,
          ['Profile Image']: user.photoURL,
          Timestamp: serverTimestamp()
        };
        await setDoc(doc(db, "Users", user.uid), userData);
      }

      if (!user.emailVerified) {
        setMessage("Please verify your email before continuing.");
        return;
      }

      navigate('/homepage');
    } catch (err) {
      console.error("Facebook sign-in error:", err);
      setError("Facebook sign-in failed: " + err.message);
    }
  };

  const LoadingIndicator = () => (
    <div className="flex justify-center items-center">
      <FaSpinner className="animate-spin" />
    </div>
  );

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user && user.emailVerified) {
        navigate('/homepage');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="flex flex-wrap">
      <div className="w-full md:w-1/2 flex justify-center items-center">
        <img src={image} alt="Sign Up" className="object-cover w-85p h-85p rounded-large" />
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-center p-12">
        <form className="w-full max-w-md" onSubmit={handleSubmit}>
          <h2 className="text-3xl font-bold mb-6 text-center">Sign up</h2>
          <button type="button" className="w-full bg-blue-500 text-white p-2 rounded mb-4 flex items-center justify-center" onClick={signInWithGoogle}>
            <FaGoogle className="mr-2" /> Continue with Google
          </button>
          <button type="button" className="w-full bg-blue-700 text-white p-2 rounded mb-4 flex items-center justify-center" onClick={signInWithFacebook}>
            <FaFacebookF className="mr-2" /> Continue with Facebook
          </button>
          <div className="text-center my-4">or</div>
          {loading && <LoadingIndicator />}
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {message && <p className="text-green-500 text-center mb-4">{message}</p>}
          <input type="email" name="email" value={userDetails.email} onChange={handleChange} placeholder="Email" className="w-full bg-gray-100 p-2 rounded mb-2" required />
          {formErrors.email && <p className="text-red-500 text-sm mb-4">{formErrors.email}</p>}
          <input type="text" name="name" value={userDetails.name} onChange={handleChange} placeholder="Name" className="w-full bg-gray-100 p-2 rounded mb-4" required />
          <input type="file" onChange={handleImageChange} className="w-full bg-gray-100 p-2 rounded mb-4" />
          {profileImageUrl && <img src={profileImageUrl} alt="Profile Preview" className="w-20 h-20 object-cover mb-4" />}
          <input type="password" name="password" value={userDetails.password} onChange={handleChange} placeholder="Password" className="w-full bg-gray-100 p-2 rounded mb-2" required />
          {formErrors.password && <p className="text-red-500 text-sm mb-4">{formErrors.password}</p>}
          <input type="password" name="confirmPassword" value={userDetails.confirmPassword} onChange={handleChange} placeholder="Confirm Password" className="w-full bg-gray-100 p-2 rounded mb-2" required />
          {formErrors.confirmPassword && <p className="text-red-500 text-sm mb-4">{formErrors.confirmPassword}</p>}
          <button type="submit" className={`w-full bg-green-500 text-white p-2 rounded ${loading ? 'opacity-50' : ''}`} disabled={loading}>
            {loading ? 'Signing Up...' : 'Sign up'}
          </button>
          <div className="text-center mt-4 text-sm text-gray-500">
            Already have an account? <a href="/login" className="text-blue-600 hover:underline">Login now.</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
