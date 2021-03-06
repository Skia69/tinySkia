import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Layout, Row, Col } from 'antd';
import { useQuery } from '@apollo/react-hooks';
import { USER } from '../../lib/graphql/queries';
import { User as UserData, UserVariables } from '../../lib/graphql/queries/User/__generated__/User';
import { PageSkeleton, ErrorBanner } from '../../lib/components';
import { Viewer } from '../../lib/types';
import { UserProfile, UserListings, UserBookings } from './components';

interface Props {
  viewer: Viewer;
  setViewer: (viewer: Viewer) => void;
}
interface MatchParams {
  id: string;
}

const { Content } = Layout;

const PAGE_LIMIT = 4;

// we're using intersection type because there are 2 interfaces.
export const User = ({ viewer, setViewer, match }: Props & RouteComponentProps<MatchParams>) => {
  const [listingsPage, setListingsPage] = useState(1);
  const [bookingsPage, setBookingsPage] = useState(1);
  // "refetch" is being used in order to reflect the changes of a user whenever they disconnect from stripe.
  const { data, loading, error, refetch } = useQuery<UserData, UserVariables>(USER, {
    variables: {
      id: match.params.id, // extract the id from the url.
      bookingsPage,
      listingsPage,
      limit: PAGE_LIMIT,
    },
  });
  // this is used to refetch the user data when their "hasWallet" is undefined.
  const handleUserRefetch = async () => {
    await refetch();
  };

  if (loading) {
    return (
      <Content className="user">
        <PageSkeleton />
      </Content>
    );
  }

  if (error) {
    return (
      <Content className="user">
        <ErrorBanner description="This user may not exist or we've encountered an error. Please try again soon." />
        <PageSkeleton />
      </Content>
    );
  }

  const user = data ? data.user : null; // check if the user exists.
  const viewerIsUser = viewer.id === match.params.id; // check if the viewer is the user itself.

  const userListings = user ? user.listings : null;
  const userBookings = user ? user.bookings : null;

  const userProfileElement = user ? (
    <UserProfile
      user={user}
      viewer={viewer}
      viewerIsUser={viewerIsUser}
      setViewer={setViewer}
      handleUserRefetch={handleUserRefetch}
    />
  ) : null;

  const userListingsElement = userListings ? (
    <UserListings
      userListings={userListings}
      listingsPage={listingsPage}
      limit={PAGE_LIMIT}
      setListingsPage={setListingsPage}
    />
  ) : null;

  const userBookingsElement = userBookings ? (
    <UserBookings
      userBookings={userBookings}
      bookingsPage={bookingsPage}
      limit={PAGE_LIMIT}
      setBookingsPage={setBookingsPage}
    />
  ) : null;
  /* if the user couldn't connect to Stripe, 
  the URL would look something like this:`/user/${viewer.id}?stripe_error=true` 
  we can make use of that and show an Error banner. */
  const stripeError = new URL(window.location.href).searchParams.get('stripe_error');

  const stripeErrorBanner = stripeError ? (
    <ErrorBanner description="We had an issue connecting with Stripe. Please try again soon." />
  ) : null;

  return (
    <Content className="user">
      {stripeErrorBanner}
      <Row gutter={12} justify="space-between">
        <Col xs={24}>{userProfileElement}</Col>
        <Col xs={24}>
          {userListingsElement}
          {userBookingsElement}
        </Col>
      </Row>
    </Content>
  );
};
