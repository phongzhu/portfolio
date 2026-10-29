-- Grant portfolio administration to the owner Auth user identified by the user.
insert into private.portfolio_admins (user_id)
select id
from auth.users
where id = 'b66e4fd2-f5bb-4194-ba06-e2e7d3a17b86'::uuid
on conflict (user_id) do nothing;
