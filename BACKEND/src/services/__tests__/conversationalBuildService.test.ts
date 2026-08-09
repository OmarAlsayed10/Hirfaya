import { InvalidAiResponseError } from "../../lib/aiResponseValidation";
import { groqChat } from "../../lib/groqChat";
import { conversationalBuild } from "../conversationalBuildService";

jest.mock("../../lib/groqChat", () => ({ groqChat: jest.fn() }));

const mockedGroqChat = groqChat as jest.MockedFunction<typeof groqChat>;

const currentFormData = {
  personalInfo: {
    firstName: "Ada", lastName: "Lovelace", email: "ada@example.com", phoneCode: "",
    phone: "", country: "", city: "", town: "", professionalTitle: "Engineer",
    ProfessionalSummary: "", linkedin: "", github: "", portfolio: "",
  },
  experience: [],
  education: [],
  projects: [],
  skills: { skills: [], languages: "", certifications: [] },
};

const messages = [{ role: "user" as const, content: "Add TypeScript to my skills." }];

describe("conversationalBuild AI response integrity", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  test.each([
    ["malformed JSON", "not-json"],
    ["a response without form data", JSON.stringify({ reply: "I updated your CV." })],
    ["a response without a reply", JSON.stringify({ formData: currentFormData })],
  ])("2026-07 %s rejects the response without returning a CV update", async (_scenario, content) => {
    mockedGroqChat.mockResolvedValueOnce({ choices: [{ message: { content } }] } as never);

    await expect(conversationalBuild(messages, currentFormData)).rejects.toBeInstanceOf(
      InvalidAiResponseError,
    );
  });

  test("2026-07 missing provider content rejects the response without returning a CV update", async () => {
    mockedGroqChat.mockResolvedValueOnce({ choices: [] } as never);

    await expect(conversationalBuild(messages, currentFormData)).rejects.toBeInstanceOf(
      InvalidAiResponseError,
    );
  });

  test("returns a schema-complete provider update", async () => {
    const formData = { ...currentFormData, skills: { ...currentFormData.skills, skills: ["TypeScript"] } };
    mockedGroqChat.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify({ formData, reply: "Added TypeScript to your skills." }) } }],
    } as never);

    await expect(conversationalBuild(messages, currentFormData)).resolves.toEqual({
      formData,
      reply: "Added TypeScript to your skills.",
    });
  });
});