import { supabase } from "../supabase";

export class SettingsRepository {
	async getSetting(
		key: string,
		teamId: string | null,
	): Promise<number | undefined> {
		if (!teamId) throw new Error("Team not authenticated");

		const compositeKey = `${teamId}_${key}`;
		const { data, error } = await supabase
			.from("settings")
			.select("value")
			.eq("key", compositeKey)
			.maybeSingle();

		if (error) throw error;
		return data?.value;
	}

	async setSetting(
		key: string,
		value: number,
		teamId: string | null,
	): Promise<void> {
		if (!teamId) throw new Error("Team not authenticated");

		const compositeKey = `${teamId}_${key}`;
		const { error } = await supabase
			.from("settings")
			.upsert({ key: compositeKey, value }, { onConflict: "key" });

		if (error) throw error;
	}
}
