import React, { useState, useEffect, useContext } from 'react';
import TextField from '@material-ui/core/TextField';
//import { makeStyles } from '@material-ui/core/styles';
import DatePicker from '../Input/DateInput/index.js';
import H1 from '../DisplayText/H1Text';
import H2 from '../DisplayText/H2Text';
import SubmitButton from '../Buttons/SubmitButton/index';
import { useAppContext } from '../../AppContext';
import { useHistory } from 'react-router';
import './Profile.css';
import { ThemeContext } from '../../ThemeContext';
import CircularProgressWithLabel from '@material-ui/core/CircularProgress';
import NavTop from '../NavTop/index.js';

//Backend URL
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Profile() {
  //Dark / Light Theme
  const theme = useContext(ThemeContext);
  //Auth0
  const { user, isAuthenticated, accessToken, setSubmit } = useAppContext();

  // History from React Router
  const history = useHistory();

  // Material UI
  //const classes = useStyles();
  // Our States
  const [name, setName] = useState(null);
  const [myersBriggs, setMyersBriggs] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  if (!isAuthenticated) {
    history.push('/');
  }

  // Auth0  - setting logincount
  useEffect(() => {
    if (!user?.sub && !accessToken && !user?.given_name) {
      return (
        <div className='progressBar'>
          <CircularProgressWithLabel />
        </div>
      );
    }
    if (user) {
      const domain = 'dev-ip1x4wr7.eu.auth0.com';
      fetch(`https://${domain}/api/v2/users/${user?.sub}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data?.logins_count > 1) {
            history.push('/mood');
            console.log('set submit to true');
            setSubmit(true);
          }
        })
        .then(() => {
          if (user?.given_name) {
            setName(user.given_name);
          }
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }, [user, accessToken, history]);

  function handleSubmit() {
    setSubmit(true);
    async function createProfile() {
      const res = await fetch(`${BACKEND_URL}/users`, {
        method: 'POST',
        headers: {
          'content-type': 'application/JSON',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: name,
          email: user.email,
          password: 'password',
          personality: myersBriggs,
          start_date: selectedDate,
          points: 0,
        }),
      });
      const data = await res.json();
      console.log(data);
    }
    createProfile();
    history.push('/mood');
  }

  //set Mui Dark Theme
  function muiTheme(theme) {
    if (theme === 'lightTheme') {
      return 'primary';
    } else return 'secondary';
  }

  return (
    isAuthenticated && (
      <div>
      <NavTop />
      <div id={theme} className={('container', 'profile')}>
        <H1 text={'Profile'} />
        <img className='profile-pic' src={user?.picture} alt={user?.name} />
        {user?.given_name ? (
          <H2
            text={`Hi ${user?.given_name}, Welcome to your Profile Page, please add your name and bootcamp start date`}
          />
        ) : (
          <H2
            text={`Hi, Welcome to your Profile Page, please add your name and bootcamp start date`}
          />
        )}
        <form /*className={classes.root}*/ noValidate autoComplete='off'>
          <div id={theme} className={'profile'}>
            {!user?.given_name && (
              <TextField
                id='outlined-search'
                label='Name'
                type='text'
                variant='outlined'
                color={muiTheme(theme)}
                onChange={(event) => {
                  const { value } = event.target;
                  setName(value);
                }}
              />
            )}
            <br></br>
            <br></br>
            <DatePicker
              values={selectedDate}
              handleDate={setSelectedDate}
              label='Start Date'
            />
            <br></br>
            {selectedDate && (
              <SubmitButton
                className='btn'
                handleClick={() => handleSubmit()}
              />
            )}
          </div>
        </form>
      </div>
      </div>
    )
  );
}
export default Profile;
