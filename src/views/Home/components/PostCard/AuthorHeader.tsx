import React from 'react';
import moment from 'moment';
import { ADMIN_AVATAR_URL } from '@/components/PostCard/constants';
import { getAvatarColor } from '../../utils/avatarColor';

const AuthorHeader = ({ user, createdAt, isAdmin }) => {
  const initial = user?.username?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full font-paper-serif text-xl font-bold text-[var(--paper-cream)] shadow-[0_2px_0_rgba(60,44,24,.25)]"
        style={{ backgroundColor: getAvatarColor(user?.username) }}
      >
        {isAdmin ? (
          <img src={ADMIN_AVATAR_URL} alt="" className="h-full w-full object-cover" />
        ) : (
          initial
        )}
      </span>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base font-bold">{user?.username}</span>
          {isAdmin && (
            <span className="rounded-[2px] border border-[var(--paper-accent-strong)] bg-[var(--paper-yellow-soft)] px-[7px] py-[3px] font-paper-mono text-[10px] tracking-[.14em] text-[var(--paper-accent-deep)]">
              ADMIN
            </span>
          )}
        </div>
        <span className="font-paper-hand text-[19px] leading-none text-[var(--paper-muted-2)]">
          {moment.utc(createdAt).local().fromNow()}
        </span>
      </div>
    </div>
  );
};

export default AuthorHeader;
