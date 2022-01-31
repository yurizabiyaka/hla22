SELECT me.email as me_email, my_friends.email as friend_email, friends.friendship_state, friends.last_state_date 
FROM friends, users as me, users as my_friends
where friends.user_id = me.id
and friends.friend_id = my_friends.id
;
