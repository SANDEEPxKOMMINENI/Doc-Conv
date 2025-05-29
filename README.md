def find_possible_upsets(a, b):
    possible_k = set()
    n = a + b # Total games

    # Scenario 1: Eagles start as challenger
    # e_ch_slots: number of games Eagles is challenger
    # h_ch_slots: number of games Hawks is challenger
    e_ch_slots_scen1 = (n + 1) // 2
    h_ch_slots_scen1 = n // 2

    # Iterate through possible wins for Eagles as challenger
    # e_ch_wins: Eagles' wins as challenger
    # e_def_wins: Eagles' wins as defender
    # h_ch_wins: Hawks' wins as challenger
    # h_def_wins: Hawks' wins as defender
    for e_ch_wins in range(max(0, a - h_ch_slots_scen1), min(a, e_ch_slots_scen1) + 1):
        e_def_wins = a - e_ch_wins
        
        # From h_ch_wins + e_def_wins = h_ch_slots_scen1
        h_ch_wins = h_ch_slots_scen1 - e_def_wins
        
        if not (0 <= h_ch_wins <= b): # Hawks' challenger wins must be valid
            continue
            
        h_def_wins = b - h_ch_wins
        
        # Consistency check: total games Eagles challenged = Eagles' challenger wins + Hawks' defender wins
        if e_ch_wins + h_def_wins == e_ch_slots_scen1:
            k = e_ch_wins + h_ch_wins # Upsets = sum of challenger wins
            possible_k.add(k)

    # Scenario 2: Hawks start as challenger
    # h_ch_slots: number of games Hawks is challenger (as first challenger)
    # e_ch_slots: number of games Eagles is challenger (as second challenger)
    h_ch_slots_scen2 = (n + 1) // 2
    e_ch_slots_scen2 = n // 2
    
    # Iterate through possible wins for Hawks as challenger
    # Here, _a refers to Hawks' wins (b), _b refers to Eagles' wins (a)
    # h_ch_wins_s2: Hawks' wins as (first) challenger
    # e_ch_wins_s2: Eagles' wins as (second) challenger
    for h_ch_wins_s2 in range(max(0, b - e_ch_slots_scen2), min(b, h_ch_slots_scen2) + 1):
        h_def_wins_s2 = b - h_ch_wins_s2
        
        e_ch_wins_s2 = e_ch_slots_scen2 - h_def_wins_s2
        
        if not (0 <= e_ch_wins_s2 <= a): # Eagles' challenger wins must be valid
            continue
            
        e_def_wins_s2 = a - e_ch_wins_s2
        
        if h_ch_wins_s2 + e_def_wins_s2 == h_ch_slots_scen2:
            k = h_ch_wins_s2 + e_ch_wins_s2
            possible_k.add(k)
            
    result = sorted(list(possible_k))
    print(len(result))
    if result:
        print(*(result))
    else: # Handle case where result might be empty, though constraints likely prevent this.
          # The problem implies there's always at least one k.
          # If result is empty and second line is needed, print empty line or handle as per spec.
          # Given the problem, if len(result) is 0, the second print shouldn't occur or be empty.
          # For safety, if result can be empty and a line is still expected:
        print() 


# Read input
a, b = map(int, input().split())
find_possible_upsets(a, b)

























def solve_space_mission():
    N, D = map(int, input().split())
    
    directives = []
    for _ in range(D):
        directives.append(tuple(map(int, input().split())))
        
    research = [1] * N  # All parts initially state 1
    results = []
    
    for l_orig, r_orig, p_type in directives:
        # Convert to 0-based indexing for list access
        # L, R are 1-based inclusive
        l_idx = l_orig - 1
        # Loop range should be up to r_orig-1. So, range(l_idx, r_orig)
        # or range(l_idx, r_idx + 1) if r_idx = r_orig -1
        
        for i in range(l_idx, r_orig): # iterates from l_idx to r_orig-1
            if p_type == 1:
                if research[i] == 1:
                    research[i] = 2
            elif p_type == 2:
                if research[i] == 2:
                    research[i] = 1
            elif p_type == 3: # P is 3
                if research[i] == 1 or research[i] == 2:
                    research[i] = 0
        
        rest_count = 0
        for part_status in research:
            if part_status == 0:
                rest_count += 1
        # A more Pythonic way to count: rest_count = research.count(0)
        results.append(rest_count)
        
    print(*(results))

solve_space_mission()





















SELECT 
    v.volunteerId, 
    v.name, 
    t.taskId, 
    t.taskName
FROM 
    Volunteers v
JOIN 
    Tasks t 
ON 
    v.skill = t.requiredSkill 
    AND v.proficiency >= t.minLevel
ORDER BY 
    v.volunteerId;
