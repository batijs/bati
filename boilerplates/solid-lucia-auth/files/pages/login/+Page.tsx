import "./style.css";
import { createSignal, untrack } from "solid-js";
import { navigate } from "vike/client/router";

export function Page() {
  const [formData, setFormData] = createSignal({
    username: "",
    password: "",
  });

  const handleOnChange = (e: Event) => {
    const { name, value } = e.currentTarget as HTMLInputElement;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOnSubmit = async (e: Event, action: "login" | "signup") => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/api/${action}`, {
        method: "POST",
        body: JSON.stringify(untrack(formData)),
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();
      if ("error" in result) {
        console.error("An error has occurred :", result.error);
      } else {
        await navigate("/");
      }
    } catch (err) {
      console.error("An error has occurred :", err);
    }
  };
  return (
    <div class="form">
      <div class="form-content">
        <header>Login / Sign Up</header>
        <form>
          <div class="field">
            <input
              id="username"
              type="text"
              name="username"
              value={formData().username}
              onChange={handleOnChange}
              placeholder="Username"
              autocomplete="username"
            />
          </div>

          <div class="field">
            <input
              id="password"
              type="password"
              name="password"
              value={formData().password}
              onChange={handleOnChange}
              placeholder="Password"
            />
          </div>

          <div class="field button-group">
            <button type="button" class="button-field signup-button" onClick={(e) => handleOnSubmit(e, "signup")}>
              Sign Up
            </button>
            <button type="submit" class="button-field login-button" onClick={(e) => handleOnSubmit(e, "login")}>
              Login
            </button>
          </div>
        </form>
      </div>

      <div class="media-options">
        <a href="/api/login/github" class="field github">
          <img
            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCA0OTYgNTEyJz48IS0tIUZvbnQgQXdlc29tZSBGcmVlIDYuNi4wIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlL2ZyZWUgQ29weXJpZ2h0IDIwMjQgRm9udGljb25zLCBJbmMuLS0+PHBhdGggZD0nTTE2NS45IDM5Ny40YzAgMi0yLjMgMy42LTUuMiAzLjYtMy4zIC4zLTUuNi0xLjMtNS42LTMuNiAwLTIgMi4zLTMuNiA1LjItMy42IDMtLjMgNS42IDEuMyA1LjYgMy42em0tMzEuMS00LjVjLS43IDIgMS4zIDQuMyA0LjMgNC45IDIuNiAxIDUuNiAwIDYuMi0ycy0xLjMtNC4zLTQuMy01LjJjLTIuNi0uNy01LjUgLjMtNi4yIDIuM3ptNDQuMi0xLjdjLTIuOSAuNy00LjkgMi42LTQuNiA0LjkgLjMgMiAyLjkgMy4zIDUuOSAyLjYgMi45LS43IDQuOS0yLjYgNC42LTQuNi0uMy0xLjktMy0zLjItNS45LTIuOXpNMjQ0LjggOEMxMDYuMSA4IDAgMTEzLjMgMCAyNTJjMCAxMTAuOSA2OS44IDIwNS44IDE2OS41IDIzOS4yIDEyLjggMi4zIDE3LjMtNS42IDE3LjMtMTIuMSAwLTYuMi0uMy00MC40LS4zLTYxLjQgMCAwLTcwIDE1LTg0LjctMjkuOCAwIDAtMTEuNC0yOS4xLTI3LjgtMzYuNiAwIDAtMjIuOS0xNS43IDEuNi0xNS40IDAgMCAyNC45IDIgMzguNiAyNS44IDIxLjkgMzguNiA1OC42IDI3LjUgNzIuOSAyMC45IDIuMy0xNiA4LjgtMjcuMSAxNi0zMy43LTU1LjktNi4yLTExMi4zLTE0LjMtMTEyLjMtMTEwLjUgMC0yNy41IDcuNi00MS4zIDIzLjYtNTguOS0yLjYtNi41LTExLjEtMzMuMyAyLjYtNjcuOSAyMC45LTYuNSA2OSAyNyA2OSAyNyAyMC01LjYgNDEuNS04LjUgNjIuOC04LjVzNDIuOCAyLjkgNjIuOCA4LjVjMCAwIDQ4LjEtMzMuNiA2OS0yNyAxMy43IDM0LjcgNS4yIDYxLjQgMi42IDY3LjkgMTYgMTcuNyAyNS44IDMxLjUgMjUuOCA1OC45IDAgOTYuNS01OC45IDEwNC4yLTExNC44IDExMC41IDkuMiA3LjkgMTcgMjIuOSAxNyA0Ni40IDAgMzMuNy0uMyA3NS40LS4zIDgzLjYgMCA2LjUgNC42IDE0LjQgMTcuMyAxMi4xQzQyOC4yIDQ1Ny44IDQ5NiAzNjIuOSA0OTYgMjUyIDQ5NiAxMTMuMyAzODMuNSA4IDI0NC44IDh6TTk3LjIgMzUyLjljLTEuMyAxLTEgMy4zIC43IDUuMiAxLjYgMS42IDMuOSAyLjMgNS4yIDEgMS4zLTEgMS0zLjMtLjctNS4yLTEuNi0xLjYtMy45LTIuMy01LjItMXptLTEwLjgtOC4xYy0uNyAxLjMgLjMgMi45IDIuMyAzLjkgMS42IDEgMy42IC43IDQuMy0uNyAuNy0xLjMtLjMtMi45LTIuMy0zLjktMi0uNi0zLjYtLjMtNC4zIC43em0zMi40IDM1LjZjLTEuNiAxLjMtMSA0LjMgMS4zIDYuMiAyLjMgMi4zIDUuMiAyLjYgNi41IDEgMS4zLTEuMyAuNy00LjMtMS4zLTYuMi0yLjItMi4zLTUuMi0yLjYtNi41LTF6bS0xMS40LTE0LjdjLTEuNiAxLTEuNiAzLjYgMCA1LjkgMS42IDIuMyA0LjMgMy4zIDUuNiAyLjMgMS42LTEuMyAxLjYtMy45IDAtNi4yLTEuNC0yLjMtNC0zLjMtNS42LTJ6Jy8+PC9zdmc+"
            class="github-icon"
            alt=""
          />
          <span>Login with Github</span>
        </a>
      </div>
    </div>
  );
}
