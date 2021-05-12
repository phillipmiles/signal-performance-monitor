/** @jsx jsx */
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { jsx } from 'theme-ui';
import { getAuthUser } from '../redux/user/user.selectors';
import Paragraph from './Paragraph';

const UserDetails = ({ ...props }) => {
  const authUser = useSelector(getAuthUser);

  return (
    <div {...props} sx={{ p: 24 }}>
      {authUser ? (
        <div>
          <Paragraph>
            <span sx={{ fontWeight: 'bold' }}>User ID:</span> {authUser.uid}
          </Paragraph>
          <Paragraph>
            <span sx={{ fontWeight: 'bold' }}>Email:</span> {authUser.email}
          </Paragraph>
          <Paragraph>
            <span sx={{ fontWeight: 'bold' }}>Email verified:</span>{' '}
            {authUser.emailVerified ? 'true' : 'false'}
          </Paragraph>
          <Paragraph>
            <span sx={{ fontWeight: 'bold' }}>ProviderId:</span>{' '}
            {authUser.providerId}
          </Paragraph>
          <Paragraph>
            <span sx={{ fontWeight: 'bold' }}>Created at:</span>{' '}
            {authUser.metadata.creationTime}
          </Paragraph>
          <Paragraph>
            <span sx={{ fontWeight: 'bold' }}>Last signed in at:</span>{' '}
            {authUser.metadata.lastSignInTime}
          </Paragraph>
        </div>
      ) : (
        <Paragraph>No authenticated user found.</Paragraph>
      )}
    </div>
  );
};

export default UserDetails;
