type ProfileFormProps = {
  userId: string;
};

export const ProfileForm: React.FC<ProfileFormProps> = ({ userId }) => {
  return (
    <form
      id="profile-form"
      method="POST"
      action="/api/auth/profile"
      className="flex justify-between items-start gap-xs w-full mb-xs">
      <input type="hidden" name="user_id" value={userId} />
      <div className="flex items-baseline w-full min-w-0">
        <input
          type="text"
          name="full_name"
          placeholder="För- och efternamn"
          required
          className="w-full border-b border-dashed truncate min-w-0 h-[20px]"
        />
      </div>
      <button type="submit" className="button" data-variant="naked">
        Spara
      </button>
    </form>
  );
};
