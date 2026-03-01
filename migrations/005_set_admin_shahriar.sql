-- Promote specific account to admin role in public.users
-- NOTE: Password is managed by Supabase Auth, not by this table migration.

DO $$
DECLARE
  target_user_id uuid;
  update_count integer;
BEGIN
  SELECT id
  INTO target_user_id
  FROM auth.users
  WHERE lower(email) = 'shahriar19645@gmail.com'
  LIMIT 1;

  IF target_user_id IS NULL THEN
    RAISE NOTICE 'No auth user found for shahriar19645@gmail.com. Create the auth account first, then rerun this migration.';
    RETURN;
  END IF;

  -- Try to update existing row
  UPDATE public.users
  SET role = 'admin'
  WHERE user_id = target_user_id;

  GET DIAGNOSTICS update_count = ROW_COUNT;

  -- If no row was updated, insert a new one
  IF update_count = 0 THEN
    INSERT INTO public.users (user_id, role)
    VALUES (target_user_id, 'admin');
  END IF;

  RAISE NOTICE 'Admin role granted to shahriar19645@gmail.com (user_id: %)', target_user_id;
END $$;