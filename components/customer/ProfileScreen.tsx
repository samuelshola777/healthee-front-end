"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

import CustomerShell from "./CustomerShell";
import { useCustomer } from "./CustomerProvider";
import { api, safeImage, type Customer } from "./api";
import styles from "./customer.module.css";
import photo from "./profile-photo.module.css";

export default function ProfileScreen() {
  const session = useCustomer();

  return (
    <CustomerShell>
      {session.loading ? (
        <p role="status">Loading your account…</p>
      ) : !session.customer ? (
        <section className={styles.panel}>
          <h1 className={styles.heading}>
            Your HEALTHEE account.
          </h1>

          {session.error && (
            <p role="alert" className={styles.alert}>
              {session.error}
            </p>
          )}

          <p className={styles.copy}>
            Sign in to view and manage your profile.
          </p>

          <Link
            className={styles.primary}
            href="/customer/login"
          >
            Sign in →
          </Link>

          <button
            className={styles.link}
            onClick={() => void session.refresh()}
          >
            Retry loading account
          </button>
        </section>
      ) : (
        <Profile
          key={session.customer.customerId}
          customer={session.customer}
        />
      )}
    </CustomerShell>
  );
}

function Profile({ customer }: { customer: Customer }) {
  const session = useCustomer();
  const router = useRouter();

  const [firstName, setFirstName] = useState(
    customer.firstName ?? "",
  );
  const [lastName, setLastName] = useState(
    customer.lastName ?? "",
  );
  const [phoneNumber, setPhoneNumber] = useState(
    customer.phoneNumber ?? "",
  );
  const [dateOfBirth, setDateOfBirth] = useState(
    customer.dateOfBirth ?? "",
  );
  const [gender, setGender] = useState(customer.gender ?? "");
  const [marketing, setMarketing] = useState(
    customer.marketingEmailsEnabled,
  );

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [deletion, setDeletion] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [imageFailed, setImageFailed] = useState(false);

  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(
    null,
  );
  const [preview, setPreview] = useState("");
  const [previewReady, setPreviewReady] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [photoAction, setPhotoAction] = useState<
    "upload" | "remove" | null
  >(null);

  const photoInput = useRef<HTMLInputElement>(null);
  const lock = useRef(false);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!selectedPhoto) {
      setPreview("");
      return;
    }

    const url = URL.createObjectURL(selectedPhoto);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [selectedPhoto]);

  useEffect(() => {
    setImageFailed(false);
  }, [customer.profilePictureUrl]);

  useEffect(
    () => () => controller.current?.abort(),
    [],
  );

  function request<T>(
    path: string,
    method: string,
    data?: unknown,
  ) {
    return api<T>(
      path,
      method,
      data,
      controller.current?.signal,
    );
  }

  async function run(
    task: () => Promise<void>,
    message: string,
  ) {
    if (lock.current) return;

    lock.current = true;
    controller.current = new AbortController();

    setBusy(true);
    setError("");
    setNotice("");

    try {
      await task();

      if (!controller.current?.signal.aborted) {
        setNotice(message);
      }
    } catch (error) {
      if (!controller.current?.signal.aborted) {
        setError(
          error instanceof Error
            ? error.message
            : "Could not save your changes.",
        );
      }
    } finally {
      lock.current = false;

      if (!controller.current?.signal.aborted) {
        setBusy(false);
      }
    }
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    void run(async () => {
      const value = await request<Customer>(
        "profile",
        "PATCH",
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phoneNumber: phoneNumber.trim(),
          ...(dateOfBirth ? { dateOfBirth } : {}),
          ...(gender ? { gender } : {}),
          marketingEmailsEnabled: marketing,
        },
      );

      session.update(value);
    }, "Your profile has been updated.");
  }

  function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (newPassword !== confirm) {
      setError("The new passwords do not match.");
      setNotice("");
      return;
    }

    void run(async () => {
      await request("change-password", "PATCH", {
        oldPassword,
        newPassword,
      });

      setOldPassword("");
      setNewPassword("");
      setConfirm("");
    }, "Your password has been changed.");
  }

  function choosePhoto(file?: File) {
    if (!file || lock.current) return;

    setPhotoError("");

    if (
      file.size === 0 ||
      file.size > 5 * 1024 * 1024 ||
      !["image/jpeg", "image/png", "image/webp"].includes(
        file.type,
      )
    ) {
      setPhotoError(
        "Choose a JPG, PNG or WebP image, up to 5 MB.",
      );
      return;
    }

    setPreviewReady(false);
    setSelectedPhoto(file);
    setError("");
    setNotice("");
  }

  function cancelPhoto() {
    if (lock.current) return;

    setSelectedPhoto(null);
    setPreviewReady(false);
    setPhotoError("");
  }

  async function uploadPhoto() {
    if (!selectedPhoto || !previewReady || lock.current) {
      return;
    }

    const file = selectedPhoto;
    setPhotoAction("upload");

    try {
      await run(async () => {
        const body = new FormData();
        body.set("file", file);

        const uploaded = await request<{
          fileUrl: string;
        }>("avatar", "POST", body);

        if (!safeImage(uploaded.fileUrl)) {
          throw new Error(
            "The upload returned an invalid image address.",
          );
        }

        // Persist the new URL before the backend removes the old asset.
        const value = await request<Customer>(
          "profile",
          "PATCH",
          {
            profilePictureUrl: uploaded.fileUrl,
          },
        );

        if (controller.current?.signal.aborted) return;

        session.update(value);
        setImageFailed(false);
        setSelectedPhoto(null);
        setPreviewReady(false);
      }, "Your profile photo has been updated.");
    } finally {
      if (!controller.current?.signal.aborted) {
        setPhotoAction(null);
      }
    }
  }

  async function removePhoto() {
    if (lock.current) return;

    setPhotoAction("remove");

    try {
      await run(async () => {
        const value = await request<Customer>(
          "profile",
          "PATCH",
          {
            profilePictureUrl: "",
          },
        );

        if (controller.current?.signal.aborted) return;

        session.update(value);
        setImageFailed(false);
        setPhotoError("");
      }, "Your profile photo has been removed.");
    } finally {
      if (!controller.current?.signal.aborted) {
        setPhotoAction(null);
      }
    }
  }

  const avatar = safeImage(customer.profilePictureUrl);

  return (
    <div className={styles.workspace}>
      <aside className={styles.sidebar}>
        <span className={styles.eyebrow}>
          YOUR LITTLE CORNER
        </span>

        <h2>
          Hello, {customer.firstName || "juice lover"}.
        </h2>

        <p>{customer.emailAddress}</p>

        <Link href="#profile" aria-current="page">
          My profile
        </Link>

        <Link href="/cart">My basket</Link>

        <Link href="#security">
          Password & security
        </Link>

        <button
          disabled={busy}
          onClick={() =>
            void run(async () => {
              await session.logout();
              router.push("/");
            }, "")
          }
        >
          Sign out
        </button>
      </aside>

      <div className={styles.content}>
        <div>
          <span className={styles.eyebrow}>
            MADE FOR YOU
          </span>

          <h1 className={styles.heading}>My profile.</h1>

          <p className={styles.copy}>
            Keep your details fresh, so you’re ready when
            it’s time to arrange pickup.
          </p>
        </div>

        {error && (
          <p className={styles.alert} role="alert">
            {error}
          </p>
        )}

        {notice && (
          <p className={styles.success} role="status">
            {notice}
          </p>
        )}

        <section
          className={`${styles.panel} ${photo.card}`}
          id="profile"
        >
          <fieldset
            className={photo.picker}
            disabled={busy}
            aria-busy={photoAction !== null}
          >
            <legend className={photo.srOnly}>
              Profile photo
            </legend>

            <div className={photo.layout}>
              <div className={photo.portrait}>
                {selectedPhoto ? (
                  preview ? (
                    <img
                      key={preview}
                      src={preview}
                      alt="Preview of your new profile photo"
                      onLoad={() => setPreviewReady(true)}
                      onError={() => {
                        setPreviewReady(false);
                        setPhotoError(
                          "This image could not be opened. Choose another photo.",
                        );
                      }}
                    />
                  ) : (
                    <span className={photo.initials}>…</span>
                  )
                ) : avatar && !imageFailed ? (
                  <img
                    src={avatar}
                    alt="Your profile"
                    onError={() => setImageFailed(true)}
                  />
                ) : (
                  <span
                    className={photo.initials}
                    aria-label="Profile initials"
                  >
                    {(
                      (customer.firstName?.[0] || "H") +
                      (customer.lastName?.[0] || "")
                    ).toUpperCase()}
                  </span>
                )}

                <span
                  className={photo.camera}
                  aria-hidden="true"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M8 6 9.5 3.5h5L16 6h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
                    <circle cx="12" cy="12.5" r="3.5" />
                  </svg>
                </span>
              </div>

              <div className={photo.details}>
                <span className={photo.eyebrow}>
                  A FACE TO YOUR FAVOURITES
                </span>

                <h2>Your profile photo</h2>

                <p
                  className={photo.description}
                  id="profile-photo-help"
                >
                  Add a little you to your HEALTHEE account.
                  Choose a JPG, PNG or WebP image, up to 5 MB.
                </p>

                <input
                  ref={photoInput}
                  className={photo.srOnly}
                  tabIndex={-1}
                  aria-label="Upload profile photo"
                  aria-describedby="profile-photo-help"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => {
                    choosePhoto(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />

                <div className={photo.actions}>
                  <button
                    type="button"
                    className={photo.choose}
                    onClick={() => photoInput.current?.click()}
                  >
                    {selectedPhoto
                      ? "Choose another"
                      : avatar
                        ? "Change photo"
                        : "Choose photo"}
                  </button>

                  {selectedPhoto ? (
                    <>
                      <button
                        type="button"
                        className={photo.save}
                        disabled={
                          !previewReady || Boolean(photoError)
                        }
                        onClick={() => void uploadPhoto()}
                      >
                        {photoAction === "upload"
                          ? "Saving photo…"
                          : "Save photo"}
                      </button>

                      <button
                        type="button"
                        className={photo.textButton}
                        onClick={cancelPhoto}
                      >
                        Cancel
                      </button>
                    </>
                  ) : avatar ? (
                    <button
                      type="button"
                      className={photo.textButton}
                      onClick={() => void removePhoto()}
                    >
                      {photoAction === "remove"
                        ? "Removing…"
                        : "Remove profile photo"}
                    </button>
                  ) : null}
                </div>

                {selectedPhoto && (
                  <p className={photo.file} role="status">
                    <strong>{selectedPhoto.name}</strong>

                    <span>
                      {(
                        selectedPhoto.size /
                        1024 /
                        1024
                      ).toFixed(2)}{" "}
                      MB · Preview only until you save.
                    </span>
                  </p>
                )}

                {photoError && (
                  <p className={photo.error} role="alert">
                    {photoError}
                  </p>
                )}

                {photoAction && (
                  <p className={photo.progress} role="status">
                    <span
                      className={photo.spinner}
                      aria-hidden="true"
                    />

                    {photoAction === "upload"
                      ? "Uploading and saving your photo. Please wait…"
                      : "Removing your saved photo…"}
                  </p>
                )}
              </div>
            </div>
          </fieldset>

          <div className={photo.footer}>
            <span className={styles.badge}>
              {customer.verified
                ? "Email verified"
                : "Email not verified"}
              {" · "}
              {customer.customerNumber}
            </span>

            <span>Your photo is optional.</span>
          </div>
        </section>

        <section className={styles.panel}>
          <h2>Personal details</h2>

          <form
            className={styles.form}
            onSubmit={saveProfile}
          >
            <fieldset disabled={busy}>
              <div className={styles.two}>
                <label>
                  First name
                  <input
                    name="firstName"
                    autoComplete="given-name"
                    maxLength={100}
                    required
                    value={firstName}
                    onChange={(event) =>
                      setFirstName(event.target.value)
                    }
                  />
                </label>

                <label>
                  Last name
                  <input
                    name="lastName"
                    autoComplete="family-name"
                    maxLength={100}
                    required
                    value={lastName}
                    onChange={(event) =>
                      setLastName(event.target.value)
                    }
                  />
                </label>

                <label>
                  Email address
                  <input
                    type="email"
                    value={customer.emailAddress}
                    readOnly
                  />
                  <small>
                    Your sign-in email cannot be changed here.
                  </small>
                </label>

                <label>
                  Phone number
                  <input
                    type="tel"
                    name="phoneNumber"
                    autoComplete="tel"
                    maxLength={30}
                    value={phoneNumber}
                    onChange={(event) =>
                      setPhoneNumber(event.target.value)
                    }
                  />
                </label>

                <label>
                  Date of birth
                  <input
                    type="date"
                    name="dateOfBirth"
                    autoComplete="bday"
                    value={dateOfBirth}
                    onChange={(event) =>
                      setDateOfBirth(event.target.value)
                    }
                  />
                  <small>
                    Optional. Must be a date in the past.
                  </small>
                </label>

                <label>
                  Gender
                  <select
                    name="gender"
                    value={gender}
                    onChange={(event) =>
                      setGender(event.target.value)
                    }
                  >
                    <option value="">
                      Choose if you wish
                    </option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="NON_BINARY">
                      Non-binary
                    </option>
                  </select>
                </label>
              </div>

              <label className={styles.check}>
                <input
                  type="checkbox"
                  name="marketingEmailsEnabled"
                  checked={marketing}
                  onChange={(event) =>
                    setMarketing(event.target.checked)
                  }
                />
                Send me HEALTHEE news and offers by email.
              </label>

              <button
                className={styles.primary}
                type="submit"
              >
                {busy
                  ? "Please wait…"
                  : "Save my details →"}
              </button>
            </fieldset>
          </form>
        </section>

        <section className={styles.panel} id="security">
          <h2>Password & security</h2>

          <form
            className={styles.form}
            onSubmit={savePassword}
          >
            <fieldset disabled={busy}>
              <label>
                Current password
                <input
                  type="password"
                  name="oldPassword"
                  autoComplete="current-password"
                  required
                  maxLength={100}
                  value={oldPassword}
                  onChange={(event) =>
                    setOldPassword(event.target.value)
                  }
                />
              </label>

              <div className={styles.two}>
                <label>
                  New password
                  <input
                    type="password"
                    name="newPassword"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={100}
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(event.target.value)
                    }
                  />
                </label>

                <label>
                  Confirm new password
                  <input
                    type="password"
                    name="confirmPassword"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={100}
                    value={confirm}
                    onChange={(event) =>
                      setConfirm(event.target.value)
                    }
                  />
                </label>
              </div>

              <button
                className={styles.secondary}
                type="submit"
              >
                Change password
              </button>
            </fieldset>
          </form>
        </section>

        <section className={styles.panel}>
          <h2>Delete my account</h2>

          <p className={styles.copy}>
            This deactivates your account and removes
            your profile photo. Type DELETE to confirm.
          </p>

          <form
            className={styles.form}
            onSubmit={(event) => {
              event.preventDefault();

              if (deletion === "DELETE") {
                void run(async () => {
                  await request("profile", "DELETE");
                  await session.refresh();
                  router.push("/");
                }, "");
              }
            }}
          >
            <label>
              Confirmation
              <input
                name="deleteConfirmation"
                autoComplete="off"
                value={deletion}
                onChange={(event) =>
                  setDeletion(event.target.value)
                }
                disabled={busy}
              />
            </label>

            <button
              className={styles.danger}
              disabled={busy || deletion !== "DELETE"}
              type="submit"
            >
              Delete my account
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}