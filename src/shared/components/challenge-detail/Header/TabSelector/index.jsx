/* eslint jsx-a11y/no-static-element-interactions:0 */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/*
  Stateless tab control to switch between various views available in
  challenge detail page.
*/

import _ from 'lodash';
import React, { useState } from 'react';
import PT from 'prop-types';
import cn from 'classnames';
import { TABS as DETAIL_TABS } from 'actions/page/challenge-details';
import { config } from 'topcoder-react-utils';
import { useMediaQuery } from 'react-responsive';
import ArrowIcon from 'assets/images/ico-arrow-down.svg';
import CloseIcon from 'assets/images/icon-close-green.svg';
import SortIcon from 'assets/images/icon-sort-mobile.svg';

import style from './style.scss';

function getSelectorStyle(selectedView, currentView) {
  return `challenge-selector-common ${(selectedView === currentView
    ? 'challenge-selected-view' : 'challenge-unselected-view')}`;
}

export default function ChallengeViewSelector(props) {
  const {
    isLoggedIn,
    challenge,
    isMM,
    checkpointCount,
    numOfRegistrants,
    numOfCheckpointSubmissions,
    numOfSubmissions,
    numWinners,
    onSelectorClicked,
    selectedView,
    trackLower,
    hasRegistered,
    mySubmissions,
    onSort,
  } = props;

  const { type, tags } = challenge;

  const [currentSelected, setCurrentSelected] = useState('Details');
  const [isTabClosed, setIsTabClosed] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [selectedSortOption, setSelectedSortOption] = useState('Rating: High to Low');
  const isF2F = type === 'First2Finish';
  const isBugHunt = _.includes(tags, 'Bug Hunt');
  const isDesign = trackLower === 'design';

  let SubmissionSortOptions = [
    { field: 'Rating', sort: 'asc', name: 'Rating: High to Low' },
    { field: 'Rating', sort: 'desc', name: 'Rating: Low to High' },
    { field: 'Username', sort: 'asc', name: 'Username' },
    { field: 'Submission Date', sort: 'asc', name: 'Submission Date: New to Old' },
    { field: 'Submission Date', sort: 'desc', name: 'Submission Date: Old to New' },
    { field: 'Initial Score', sort: 'desc', name: 'Initial Score: High to Low' },
    { field: 'Initial Score', sort: 'asc', name: 'Initial Score: Low to High' },
    { field: 'Final Score', sort: 'desc', name: 'Final Score: High to Low' },
    { field: 'Final Score', sort: 'asc', name: 'Final Score: Low to High' },
  ];

  let RegistrationSortOptions = [
    { field: 'Rating', sort: 'asc', name: 'Rating: High to Low' },
    { field: 'Rating', sort: 'desc', name: 'Rating: Low to High' },
    { field: 'Username', sort: 'asc', name: 'Username' },
    { field: 'Registration Date', sort: 'asc', name: 'Registration Date: New to Old' },
    { field: 'Registration Date', sort: 'desc', name: 'Registration Date: Old to New' },
    { field: 'Submitted Date', sort: 'asc', name: 'Submitted Date: New to Old' },
    { field: 'Submitted Date', sort: 'desc', name: 'Submitted Date: Old to New' },
  ];

  if (isF2F || isBugHunt) {
    SubmissionSortOptions = SubmissionSortOptions.slice(2);
  }

  if (isDesign) {
    RegistrationSortOptions = RegistrationSortOptions.slice(2);
  }

  const sortOptions = currentSelected === 'submissions' ? SubmissionSortOptions : RegistrationSortOptions;

  const numOfSub = numOfSubmissions + (numOfCheckpointSubmissions || 0);
  const forumId = _.get(challenge, 'legacy.forumId') || 0;
  const discuss = _.get(challenge, 'discussions', []).filter(d => (
    d.type === 'challenge' && !_.isEmpty(d.url)
  ));
  const roles = _.get(challenge, 'userDetails.roles') || [];

  const forumEndpoint = isDesign
    ? `/?module=ThreadList&forumID=${forumId}`
    : `/?module=Category&categoryID=${forumId}`;

  const handleSelectorClicked = (e, selector) => {
    /* eslint-env browser */
    e.preventDefault();
    setCurrentSelected(selector);
    setIsTabClosed(true);
    onSelectorClicked(selector);
  };

  const handleScroll = (e) => {
    const scrollElement = e.target;

    const cname = style.mask;
    /* eslint-env browser */
    const masks = document.getElementsByClassName(cname);
    const mask1 = masks[0];
    const mask2 = masks[1];
    // When the scrollbar reaches end, disable right mask.
    if (scrollElement.scrollWidth - scrollElement.scrollLeft === scrollElement.clientWidth) {
      mask2.style.display = 'none';
    } else if (scrollElement.scrollLeft === 0) {
      // At the beginning, disable left mask.
      mask1.style.display = 'none';
    } else {
      // Show both masks in between.
      mask1.style.display = 'block';
      mask2.style.display = 'block';
    }
  };

  const desktop = useMediaQuery({ minWidth: 1024 });

  const tabDetail = (
    <React.Fragment>
      <a
        tabIndex="0"
        role="tab"
        aria-selected={selectedView === DETAIL_TABS.DETAILS}
        onClick={(e) => { handleSelectorClicked(e, DETAIL_TABS.DETAILS); }}
        onKeyPress={(e) => { handleSelectorClicked(e, DETAIL_TABS.DETAILS); }}
        styleName={getSelectorStyle(selectedView, DETAIL_TABS.DETAILS)}
      >
        DETAILS
      </a>
      {
        numOfRegistrants ? (
          <a
            tabIndex="0"
            role="tab"
            aria-selected={selectedView === DETAIL_TABS.REGISTRANTS}
            onClick={(e) => {
              handleSelectorClicked(e, DETAIL_TABS.REGISTRANTS);
            }}
            onKeyPress={(e) => {
              handleSelectorClicked(e, DETAIL_TABS.REGISTRANTS);
            }}
            styleName={getSelectorStyle(selectedView, DETAIL_TABS.REGISTRANTS)}
          >
            REGISTRANTS
            <span styleName="num">{numOfRegistrants}</span>
          </a>
        ) : null
      }
      {
        isDesign && checkpointCount > 0
        && (
        <a
          tabIndex="0"
          role="tab"
          aria-selected={selectedView === DETAIL_TABS.CHECKPOINTS}
          onClick={(e) => { handleSelectorClicked(e, DETAIL_TABS.CHECKPOINTS); }}
          onKeyPress={(e) => { handleSelectorClicked(e, DETAIL_TABS.CHECKPOINTS); }}
          styleName={getSelectorStyle(selectedView, DETAIL_TABS.CHECKPOINTS)}
        >
          CHECKPOINTS (
          {checkpointCount}
          )
        </a>
        )
      }
      {
        (numOfSub && isLoggedIn) ? (
          <a
            tabIndex="0"
            role="tab"
            aria-selected={selectedView === DETAIL_TABS.SUBMISSIONS}
            onClick={(e) => { handleSelectorClicked(e, DETAIL_TABS.SUBMISSIONS); }}
            onKeyPress={(e) => { handleSelectorClicked(e, DETAIL_TABS.SUBMISSIONS); }}
            styleName={getSelectorStyle(selectedView, DETAIL_TABS.SUBMISSIONS)}
          >
            SUBMISSIONS
            <span styleName="num">{numOfSub}</span>
          </a>
        ) : null
      }
      {
        (hasRegistered && isMM && mySubmissions) ? (
          <a
            tabIndex="0"
            role="tab"
            aria-selected={selectedView === DETAIL_TABS.MY_SUBMISSIONS}
            onClick={(e) => { handleSelectorClicked(e, DETAIL_TABS.MY_SUBMISSIONS); }}
            onKeyPress={(e) => { handleSelectorClicked(e, DETAIL_TABS.MY_SUBMISSIONS); }}
            styleName={getSelectorStyle(selectedView, DETAIL_TABS.MY_SUBMISSIONS)}
          >
            MY SUBMISSIONS
            <span styleName="num">{mySubmissions.length}</span>
          </a>
        ) : null
      }
      {
        (hasRegistered && mySubmissions.length > 0) && (
          <a
            href={`${config.URL.SUBMISSION_REVIEW}/challenges/${challenge.legacyId}`}
            styleName="challenge-selector-common challenge-unselected-view"
            target="_blank"
            rel="oopener noreferrer"
          >
            SUBMISSION REVIEW
          </a>
        )
      }
      {
        numWinners ? (
          <a
            tabIndex="0"
            role="tab"
            aria-selected={selectedView === DETAIL_TABS.WINNERS}
            onClick={(e) => { handleSelectorClicked(e, DETAIL_TABS.WINNERS); }}
            onKeyPress={(e) => { handleSelectorClicked(e, DETAIL_TABS.WINNERS); }}
            styleName={getSelectorStyle(selectedView, DETAIL_TABS.WINNERS)}
          >
            WINNERS
            <span styleName="num">{numWinners}</span>
          </a>
        ) : null
      }
      { (() => {
        if (hasRegistered || Boolean(roles.length)) {
          if (!_.isEmpty(discuss)) {
            return (
              discuss.map(d => (
                <a
                  href={d.url}
                  styleName={getSelectorStyle(selectedView, DETAIL_TABS.CHALLENGE_FORUM)}
                  target="_blank"
                  rel="oopener noreferrer"
                >
                  CHALLENGE DISCUSSION
                </a>
              ))
            );
          }
          if (forumId > 0) {
            return (
              <a
                href={`${config.URL.FORUMS}${forumEndpoint}`}
                styleName={getSelectorStyle(selectedView, DETAIL_TABS.CHALLENGE_FORUM)}
                target="_blank"
                rel="oopener noreferrer"
              >
                CHALLENGE FORUM
              </a>
            );
          }
        }
        return '';
      })()}
      {
        isMM && (
          <a
            tabIndex="0"
            role="tab"
            aria-selected={selectedView === DETAIL_TABS.MM_DASHBOARD}
            onClick={(e) => { handleSelectorClicked(e, DETAIL_TABS.MM_DASHBOARD); }}
            onKeyPress={(e) => { handleSelectorClicked(e, DETAIL_TABS.MM_DASHBOARD); }}
            styleName={getSelectorStyle(selectedView, DETAIL_TABS.MM_DASHBOARD)}
          >
            DASHBOARD
          </a>
        )
      }
    </React.Fragment>
  );

  return (
    <div
      styleName="container"
      onScroll={handleScroll}
    >
      {
        !desktop && (
          <div styleName="mobile-wrapper">
            <div styleName="challenge-view-selector-mobile">
              <div
                styleName="mobile-tab-container"
                role="presentation"
                onClick={() => setIsTabClosed(!isTabClosed)}
              >
                <p styleName="title">{currentSelected}</p>
                <div
                  role="presentation"
                  styleName={cn('icon', { down: !isTabClosed })}
                  onClick={() => setIsTabClosed(!isTabClosed)}
                >
                  <ArrowIcon />
                </div>
              </div>
              {
          !isTabClosed && (
            <div styleName="mobile-tab-expanded">
              {tabDetail}
            </div>
          )
        }
            </div>
            {
              (currentSelected === 'submissions' || currentSelected === 'registrants') && (
                <div
                  styleName="mobile-sort-icon"
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpanded(!expanded)}
                >
                  <SortIcon />
                </div>
              )
            }
            {
              expanded && (
                <div styleName="sort-overlay">
                  <div styleName="sort-header">
                    <p>SORT</p>
                    <div role="button" onClick={() => setExpanded(false)} tabIndex={0}>
                      <CloseIcon />
                    </div>
                  </div>
                  <div styleName="sort-body">
                    {
                      sortOptions.map((option, index) => (
                        <div
                          map={`sort-option-${index}`}
                          styleName="sort-item"
                          onClick={() => {
                            setSelectedSortOption(option.name);
                            onSort(currentSelected, option);
                            setExpanded(false);
                          }}
                        >
                          <span styleName={`${option.name === selectedSortOption ? 'bold' : ''}`}>{option.name}</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )
            }
          </div>
        )
      }
      {
        desktop && (
          <div styleName="challenge-view-selector">
            {tabDetail}
          </div>
        )
      }
    </div>
  );
}

ChallengeViewSelector.defaultProps = {
  isLoggedIn: false,
  challenge: {},
  isMM: false,
  checkpointCount: 0,
  numOfRegistrants: 0,
  numOfCheckpointSubmissions: 0,
  numOfSubmissions: 0,
};

ChallengeViewSelector.propTypes = {
  isLoggedIn: PT.bool,
  challenge: PT.shape({
    id: PT.string,
    legacyId: PT.string,
    legacy: PT.shape({
      forumId: PT.number,
    }),
    userDetails: PT.shape({
      roles: PT.arrayOf(PT.string),
    }),
    type: PT.string,
    track: PT.string,
    tags: PT.arrayOf(PT.shape()),
  }),
  isMM: PT.bool,
  checkpointCount: PT.number,
  numOfRegistrants: PT.number,
  numOfCheckpointSubmissions: PT.number,
  numOfSubmissions: PT.number,
  numWinners: PT.number.isRequired,
  onSelectorClicked: PT.func.isRequired,
  selectedView: PT.string.isRequired,
  trackLower: PT.string.isRequired,
  hasRegistered: PT.bool.isRequired,
  mySubmissions: PT.arrayOf(PT.shape()).isRequired,
  onSort: PT.func.isRequired,
};
