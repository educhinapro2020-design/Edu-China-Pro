/*
* Author: Nikesh
* Description: Allow admins to update all user profiles
*/

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (public.is_admin());
