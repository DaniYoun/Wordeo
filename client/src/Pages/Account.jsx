import React, { useEffect } from 'react';
import Button from '../Components/Button';

// Styles
import '../Styles/Account.css';
// Components and Resources
import WordeoLogo from '../Images/WordeoLogo.png';
import Achievement from '../Components/Achievement';

// API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Change this to true to test achievements
const testingAchievements = false;
const testingAchievementsData = [
  {
    name: 'Achievement 1',
    description: 'This is an achievement',
    locked: false,
  },
  {
    name: 'Achievement 2',
    description: 'This is a locked achievement',
    locked: true,
  },
  {
    name: 'Achievement 1',
    description: 'This is an achievement',
    locked: false,
  },
  {
    name: 'Achievement 2',
    description: 'This is a locked achievement',
    locked: true,
  },
  {
    name: 'Achievement 1',
    description: 'This is an achievement',
    locked: false,
  },
  {
    name: 'Achievement 2',
    description: 'This is a locked achievement',
    locked: true,
  },
];

/**
 * **Account page for a user on Wordeo**
 *
 * The account page should be accessible with: `/account/:userName`
 * NOT `displayName`!
 *
 * `displayName` is shown in the account page and on the button in the home page.
 * As well as across the game, however, URLs and communicating with the backend
 * should only use the `userName`.
 *
 * This page was rewritten.
 *
 * *Backend*: `V2`
 * @returns React page for the account page
 */
function AccountPage() {
  // STATE

  const [accountInformation, setAccountInformation] = React.useState({
    userName: '',
    displayName: '',
    highestScore: 0,
    gamesPlayed: 0,
    wordsGuessed: 0,
    accountDescription: '',
    achievements: testingAchievements ? testingAchievementsData : [],
    inventory: [],
  });

  const [editing, setEditing] = React.useState(false);
  const [editingError, setEditingError] = React.useState('');
  const [deleting, setDeleting] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [testEnvironment, setTestEnvironment] = React.useState(false);

  useEffect(() => {
    getAccountDetails();

    // Check if in Jest test environment
    if (process.env.NODE_ENV === 'test') {
      setTestEnvironment(true);
    }
  }, []);

  // ----------------

  // BACK END CALLS

  /**
     * **Gets account details from backend**
     *
     * This function will be called on page load.
     *
     * If false is returned, it is presumed the user is not signed in.
     *
     * *Backend*: `V2`
     * @returns True if account details were retrieved correctly, false if not.
     */
  async function getAccountDetails() {
    if (testEnvironment) {
      // Test environment, set userName to URL parameter
      const urlUserName = window.location.pathname.split('/')[2];
      setAccountInformation({
        userName: urlUserName,
        displayName: urlUserName,
        highestScore: 0,
        gamesPlayed: 0,
        wordsGuessed: 0,
        accountDescription: '',
        achievements: [
          {
            name: 'testAch1',
            description: 'testAch1',
            locked: false,
          },
          {
            name: 'testAch2',
            description: 'testAch2',
            locked: true,
          },
        ],
        inventory: [
          {
            name: 'testItem',
            quantity: 1,
          },
        ],
      });
      return true;
    }

    const displayNameExists = document.cookie.split(';').some((item) => item.trim().startsWith('displayName='));
    const userNameExists = document.cookie.split(';').some((item) => item.trim().startsWith('userName='));

    try {
      if (displayNameExists && userNameExists) {
        const userName = (`; ${document.cookie}`).split('; userName=').pop().split(';')[0];
        // Can now connect to backend
        const response = await fetch(`${API_URL}/user?userName=${userName}`);
        const data = await response.json();

        const scores = await fetch(`${API_URL}/scores?userName=${userName}`);
        const scoreData = await scores.json();

        if (!response.ok || !scores.ok) {
          console.log('An error occurred while trying to get your account details. You have been signed out.');
          return expireCookiesAndRedirect();
        }
        if (data.response === null) {
          // Check for a server message
          if (data.message) {
            console.log(data.message);
            return expireCookiesAndRedirect();
          }
          // No message, wrong call?
          console.log('An error occurred while trying to get your account details. You have been signed out.');
          return expireCookiesAndRedirect();
        }
        // Potential check: review all these fields are present
        setAccountInformation({
          userName: data.response.userName,
          displayName: data.response.displayName,
          highestScore: scoreData.response[0].score,
          gamesPlayed: data.response.gamesPlayed,
          wordsGuessed: data.response.wordsGuessed,
          accountDescription: data.response.description,
          achievements: data.response.achievements,
          inventory: data.response.inventory,
        });

        // Update cookies to match backend on path '/'
        document.cookie = `userName=${data.response.userName};path=/;domain=`;
        document.cookie = `displayName=${data.response.displayName};path=/;domain=`;

        // Account info retrieved
        return true;
      }
      // Cannot connect to backend, sign in again, remove cookies if exist
      return expireCookiesAndRedirect();
    } catch (error) {
      alert(error);
      return false;
    }
  }

  /**
     * **Performs the backend edit to the account**
     *
     * This function will only be called after the front end checks have been completed.
     *
     * Front end checks involve checking the cookie `userName` still exists in the state.
     * This is to prevent modifying the cookie `userName` to edit another account.
     *
     * *Backend*: `V2`
     * @param {string} userName userName to edit, front end checks should ensure this is the same as the cookie
     * @param {string} displayName Display name to edit to
     * @param {string} description Description to edit to
     */
  async function performAccountEdit(userName, displayName, description) {
    // PATCH /user

    let updatedDisplayName = displayName;
    let updatedDescription = description;

    if (testEnvironment) {
      setAccountInformation({
        ...accountInformation,
        displayName,
        accountDescription: description,
      });
      return true;
    }

    if (displayName.length === 0) updatedDisplayName = accountInformation.displayName;
    if (description.length === 0) updatedDescription = accountInformation.accountDescription;

    const response = await fetch(`${API_URL}/user`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userName,
        displayName: updatedDisplayName,
        description: updatedDescription,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Check for a server message
      if (data.message) {
        console.log(data.message);
        return expireCookiesAndRedirect();
      }
      // No message, wrong call?
      console.log('An error occurred while trying to edit your account details. You have been signed out.');
      return expireCookiesAndRedirect();
    }
    // Update state
    setAccountInformation({
      ...accountInformation,
      displayName: data.displayName,
      accountDescription: data.description,
    });

    // Update cookies to match backend on path '/'
    document.cookie = `displayName=${data.displayName};path=/;domain=`;

    // Reload page
    window.location.pathname = `/account/${accountInformation.userName}`;

    // Account info retrieved
    return true;
  }

  /**
     * **Performs the backend deletion of the account**
     *
     * This function will only be called after the front end checks have been completed.
     *
     * Front end checks involve checking the cookie `userName` still exists in the state.
     * This is to prevent modifying the cookie `userName` to edit another account.
     *
     * *Backend*: `V2`
     * @param {string} userName userName to delete, front end checks should ensure this is the same as the cookie
     */
  async function performAccountDeletion(userName) {
    // DELETE /user

    const response = await fetch(`${API_URL}/user`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userName,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Check for a server message
      if (data.message) {
        console.log(data.message);
        return expireCookiesAndRedirect();
      }
      // No message, wrong call?
      console.log('An error occurred while trying to delete your account. You have been signed out.');
      return expireCookiesAndRedirect();
    }
    return expireCookiesAndRedirect();
  }

  // ----------------

  // FRONT END CALLS

  /**
     * **Used to verify edits to the account**
     * Front-end only, then calls the backend edit.
     *
     * This function will be called when the user clicks the "Apply Changes" button on the delete account page.
     */
  function verifyEdit() {
    let newDisplayName = document.getElementById('displayNameEditBox').value;
    let newDescription = document.getElementById('descriptionEditBox').value;

    // The text boxes are limited to 15 and 200 characters respectively,
    // but this is a double check.
    if (newDisplayName.length < 1) {
      setEditingError('Display name is too short!');
      return false;
    } if (newDisplayName.length > 15) {
      setEditingError('Display name is too long!');
      return false;
    } if (newDescription.length > 200) {
      setEditingError('Description is too long!');
      return false;
    } if (newDisplayName.length === 0 && newDescription.length === 0) {
      // No changes, cancel editing.
      newDisplayName = accountInformation.displayName;
      newDescription = accountInformation.accountDescription;
      setEditing(false);
    } else {
      setEditingError('');
    }

    // Check cookie still exists against the userName in state
    // If it does, call backend edit
    // If it doesn't, sign out

    // Get cookie userName
    const userNameFromCookie = (`; ${document.cookie}`).split('; userName=').pop().split(';')[0];
    // Get state userName
    const stateUserName = accountInformation.userName;

    if (userNameFromCookie === stateUserName || testEnvironment) {
      // Call backend edit
      performAccountEdit(stateUserName, newDisplayName, newDescription);
    } else {
      // Sign out
      expireCookiesAndRedirect();
    }
  }

  /**
     * **Used to verify the deletion of the account**
     * Front-end only, then calls the backend deletion.
     *
     * This function will be called when the user clicks the "Yes I am sure." button on the delete account page.
     */
  function verifyDeletion() {
    // Check cookie still exists against the userName in state
    // If it does, call backend deletion
    // If it doesn't, sign out

    // Get cookie userName
    const userName = (`; ${document.cookie}`).split('; userName=').pop().split(';')[0];
    // Get state userName
    const stateUserName = accountInformation.userName;

    if (userName === stateUserName || testEnvironment) {
      // Call backend deletion
      performAccountDeletion(stateUserName);
    } else {
      // Sign out
      expireCookiesAndRedirect();
    }
  }

  /**
    * **Expires cookies and redirects to specified page**
    */
  function expireCookiesAndRedirect(redirect = '/account/signin') {
    document.cookie = 'userName=;path=/;domain=;expires=Thu, 01 Jan 1970 00:00:00 UTC';
    document.cookie = 'displayName=;path=/;domain=;expires=Thu, 01 Jan 1970 00:00:00 UTC';

    // clear state
    setAccountInformation({
      userName: '',
      displayName: '',
      highestScore: 0,
      gamesPlayed: 0,
      wordsGuessed: 0,
      accountDescription: '',
      achievements: [],
    });

    window.location.pathname = redirect;
  }

  // PAGE RENDERING

  /**
     * **Renders the achievements**
     *
     * This function will be called when the page loads.
     * @returns React Achievement component for each achievement in the account
     */
  const achievementsData = () => {
    if (accountInformation.achievements) {
      if (accountInformation.achievements.length === 0) {
        return <p style={{ fontSize: 24 }}>No achievements yet!</p>;
      }

      return accountInformation.achievements.map((achievement) => (
        <Achievement key={achievement.name} name={achievement.name} description={achievement.description} locked={achievement.locked} />
      ));
    }
  };

  /**
     * **Renders the inventory**
     * @returns React Inventory component for each item in the account
     */
  const inventoryData = () => {
    if (accountInformation.inventory) {
      if (accountInformation.inventory.length === 0) {
        return <p style={{ fontSize: 24 }}>No items yet!</p>;
      }

      return accountInformation.inventory.map((item) => (
        <div className="inventoryItem">
          <span className="largeLabel inv">
            {item.name}
            {' '}
            |
            {' '}
          </span>
          <span className="largeNumber inv">{item.quantity}</span>
        </div>
      ));
    }
  };

  if (completeAllFEChecks() || testEnvironment) {
    if (editing) {
      return (
        <div className="accountPage">
          <div className="accountHeader">
            <div className="accountLogoAndText">
              <img alt="Wordeo Logo" className="accountLogo" src={WordeoLogo} onClick={() => { setEditing(false); }} />
              <h2 className="accountHeaderText">Editing account</h2>
            </div>
            <div className="accountButtons">
              <Button label="Apply Changes" onClick={() => { verifyEdit(); }}>Apply Changes</Button>
              <Button label="Delete Account" onClick={() => { setEditing(false); setDeleting(true); }} type="ternary" />
              <Button label="Cancel" onClick={() => { setEditing(false); }} type="gray" />
            </div>
          </div>
          <div className="accountBody" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div className="editingAccount" style={{ display: 'flex', alignContent: 'center', alignItems: 'center' }}>
              <form className="editingForm" onSubmit={() => { verifyEdit(); }}>
                <h4 className="largeLabel">Display Name</h4>
                <input id="displayNameEditBox" className="accountEditInput" type="text" defaultValue={accountInformation.displayName} maxLength={15} />
                <br />
                <br />
                <br />
                <h4 className="largeLabel">Account Description</h4>
                <textarea id="descriptionEditBox" className="accountEditInputDescription" type="text" defaultValue={accountInformation.accountDescription} maxLength={200} />
                <br />
                <br />
                <div className="warningNote">
                  {editingError}
                </div>
              </form>
            </div>
          </div>
        </div>
      );
    }

    if (deleting) {
      return (
        <div className="accountPage">
          <div className="accountHeader">
            <div className="accountLogoAndText">
              <img alt="Wordeo Logo" className="accountLogo" src={WordeoLogo} onClick={() => { setDeleting(false); }} />
              <h2 className="accountHeaderText">Deleting account, are you sure?</h2>
            </div>
            <div className="accountButtons" />
          </div>
          <div className="accountBody" style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <p style={{ fontSize: 30 }}>This action is irreversible and will delete all your progress!</p>
            <div className="editingAccount" style={{ display: 'flex', alignContent: 'center', alignItems: 'center' }}>
              <Button label="Yes I am sure." onClick={() => { verifyDeletion(); }} type="ternary" scale="0.9" size={20} />
              <Button label="No - I'd like to play more Wordeo!" onClick={() => { setDeleting(false); }} type="secondary" scale="0.9" size={20} />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="accountPage">
        <div className="accountHeader">
          <div className="accountLogoAndText">
            <img alt="Wordeo Logo" className="accountLogo" src={WordeoLogo} onClick={() => { window.location.pathname = '/'; }} />
            <h2 className="accountHeaderText">Account Dashboard</h2>
          </div>
          <div className="accountButtons">
            <Button label="Edit..." onClick={() => { setEditing(true); }}>Edit...</Button>
            <Button label="Sign Out" onClick={() => { setLoggingOut(true); expireCookiesAndRedirect('/'); }} type="ternary" />
          </div>
        </div>
        <div className="accountBody">
          <div className="accountBodyRight">
            <h3 className="accountDisplayName">{accountInformation.displayName}</h3>
            <div className="accountDetails">
              <h4 className="largeLabel">Highest Score</h4>
              <h4 className="largeNumber">{accountInformation.highestScore}</h4>
              <h4 className="largeLabel">Games Played</h4>
              <h4 className="largeNumber">{accountInformation.gamesPlayed}</h4>
              <h4 className="largeLabel">Words Guessed</h4>
              <h4 className="largeNumber">{accountInformation.wordsGuessed}</h4>
              <div className="accountInventory">
                <h4 className="largeLabel">Inventory</h4>
                <div className="inventoryItems">
                  {inventoryData()}
                </div>
              </div>
            </div>

          </div>
          <div className="accountBodyLeft">
            <p className="accountDescription">
              {accountInformation.accountDescription}
            </p>
            <h4 className="largeLabel">Achievements</h4>
            <div className="accountAchievements">
              {achievementsData()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!loggingOut) {
    window.location.pathname = '/account/signin';
  } else {
    window.location.pathname = '/';
  }
  return (
    <p>Redirecting...</p>
  );
}

// FRONT END CHECKS
// These can safely exist outside of the component to prevent re-renders and slow down the page.

/**
 * **Checks for URL and cookies**
 * @returns True if the URL parameter equals to the cookie `userName`, false if not
 */
function verifyURLAndCookies() {
  const displayNameExists = document.cookie.split(';').some((item) => item.trim().startsWith('displayName='));
  const userNameExists = document.cookie.split(';').some((item) => item.trim().startsWith('userName='));

  if (displayNameExists && userNameExists) {
    const userName = (`; ${document.cookie}`).split('; userName=').pop().split(';')[0];
    const urlUserName = window.location.pathname.split('/')[2];

    if (userName === urlUserName) {
      return true;
    }

    return false;
  }

  return false;
}

/**
 * Does all front end checks
 * Such as: verify the URL parameter equals to the cookie
 * @returns True if all front end checks pass, false if not
 */
function completeAllFEChecks() {
  const testURLAndCookies = verifyURLAndCookies();

  if (testURLAndCookies) {
    return true;
  }

  return false;
}
// ----------------

export default AccountPage;
